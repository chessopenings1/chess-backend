import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Puzzle, PuzzleDocument } from './schemas/puzzle.schema';
import { UserPuzzleSolve, UserPuzzleSolveDocument } from './schemas/user-puzzle-solve.schema';
import { UserPuzzleStats, UserPuzzleStatsDocument } from './schemas/user-puzzle-stats.schema';
import { SolvePuzzleDto } from './dto/solve-puzzle.dto';
import glicko2 from 'glicko2';

@Injectable()
export class PuzzleSolveService {
  private glicko: any;

  constructor(
    @InjectModel(Puzzle.name) private puzzleModel: Model<PuzzleDocument>,
    @InjectModel(UserPuzzleSolve.name) private userPuzzleSolveModel: Model<UserPuzzleSolveDocument>,
    @InjectModel(UserPuzzleStats.name) private userPuzzleStatsModel: Model<UserPuzzleStatsDocument>,
  ) {
    // Initialize Glicko-2 rating system
    this.glicko = new glicko2.Glicko2({
      tau: 0.5,        // System constant (volatility change)
      rating: 1500,    // Default rating
      rd: 350,         // Default rating deviation
      vol: 0.06        // Default volatility
    });
  }

  async solvePuzzle(userId: string, solvePuzzleDto: SolvePuzzleDto) {
    // 1. Get the puzzle
    const puzzle = await this.puzzleModel.findById(solvePuzzleDto.puzzleId).exec();
    if (!puzzle) {
      throw new NotFoundException('Puzzle not found');
    }

    const puzzleRating = puzzle.Rating;

    // 2. Get or create user stats
    let userStats = await this.userPuzzleStatsModel.findOne({ 
      userId: new Types.ObjectId(userId) 
    }).exec();

    if (!userStats) {
      // Create new stats for first-time user
      userStats = new this.userPuzzleStatsModel({
        userId: new Types.ObjectId(userId),
        totalPuzzlesSolved: 0,
        totalPuzzlesAttempted: 0,
        puzzleRating: 1500,
        ratingDeviation: 350,
        volatility: 0.06,
        correctSolves: 0,
        incorrectSolves: 0,
        currentStreak: 0,
        longestStreak: 0
      });
    }

    const userRatingBefore = userStats.puzzleRating;

    // 3. Calculate new rating using Glicko-2
    const player = this.glicko.makePlayer(
      userStats.puzzleRating,
      userStats.ratingDeviation,
      userStats.volatility
    );

    const opponent = this.glicko.makePlayer(puzzleRating, 350, 0.06);

    // Update rating based on result (1 = win, 0 = loss)
    const score = solvePuzzleDto.success ? 1 : 0;
    this.glicko.updateRatings([[player, opponent, score]]);

    const userRatingAfter = Math.round(player.getRating());
    const newRD = player.getRd();
    const newVolatility = player.getVol();

    // 4. Update user stats
    userStats.totalPuzzlesAttempted += 1;
    userStats.puzzleRating = userRatingAfter;
    userStats.ratingDeviation = newRD;
    userStats.volatility = newVolatility;
    userStats.lastSolvedAt = new Date();

    if (solvePuzzleDto.success) {
      userStats.totalPuzzlesSolved += 1;
      userStats.correctSolves += 1;
      userStats.currentStreak += 1;
      
      if (userStats.currentStreak > userStats.longestStreak) {
        userStats.longestStreak = userStats.currentStreak;
      }
    } else {
      userStats.incorrectSolves += 1;
      userStats.currentStreak = 0;
    }

    // Update average time
    const totalTime = (userStats.averageTimePerPuzzle || 0) * (userStats.totalPuzzlesAttempted - 1) + solvePuzzleDto.timeSpent;
    userStats.averageTimePerPuzzle = Math.round(totalTime / userStats.totalPuzzlesAttempted);

    await userStats.save();

    // 5. Record the solve
    const solveRecord = new this.userPuzzleSolveModel({
      userId: new Types.ObjectId(userId),
      puzzleId: new Types.ObjectId(solvePuzzleDto.puzzleId),
      puzzleRating,
      userRatingBefore,
      userRatingAfter,
      success: solvePuzzleDto.success,
      timeSpent: solvePuzzleDto.timeSpent,
      attemptsMade: solvePuzzleDto.attemptsMade || 1
    });

    await solveRecord.save();

    // 6. Return result
    return {
      success: true,
      userStats: {
        totalPuzzlesSolved: userStats.totalPuzzlesSolved,
        totalPuzzlesAttempted: userStats.totalPuzzlesAttempted,
        puzzleRating: userStats.puzzleRating,
        ratingDeviation: userStats.ratingDeviation,
        currentStreak: userStats.currentStreak,
        longestStreak: userStats.longestStreak
      },
      ratingChange: userRatingAfter - userRatingBefore,
      solveRecord: {
        id: (solveRecord as any)._id,
        success: solvePuzzleDto.success,
        timeSpent: solvePuzzleDto.timeSpent,
        ratingBefore: userRatingBefore,
        ratingAfter: userRatingAfter
      }
    };
  }

  async getUserStats(userId: string): Promise<UserPuzzleStats> {
    let userStats = await this.userPuzzleStatsModel.findOne({ 
      userId: new Types.ObjectId(userId) 
    }).exec();

    if (!userStats) {
      // Create new stats if not exists
      userStats = new this.userPuzzleStatsModel({
        userId: new Types.ObjectId(userId)
      });
      await userStats.save();
    }

    return userStats;
  }

  async getUserSolveHistory(userId: string, limit: number = 50): Promise<UserPuzzleSolve[]> {
    return await this.userPuzzleSolveModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('puzzleId')
      .exec();
  }

  async getPuzzleSolveCount(puzzleId: string): Promise<number> {
    return await this.userPuzzleSolveModel
      .countDocuments({ puzzleId: new Types.ObjectId(puzzleId) })
      .exec();
  }

  async hasUserSolvedPuzzle(userId: string, puzzleId: string): Promise<boolean> {
    const solve = await this.userPuzzleSolveModel
      .findOne({ 
        userId: new Types.ObjectId(userId),
        puzzleId: new Types.ObjectId(puzzleId),
        success: true
      })
      .exec();
    
    return !!solve;
  }

  async getRecommendedPuzzle(userId: string): Promise<Puzzle | null> {
    // 1. Get user stats
    const userStats = await this.getUserStats(userId);
    
    // 2. Get all puzzles the user has attempted
    const attemptedPuzzles = await this.userPuzzleSolveModel
      .find({ userId: new Types.ObjectId(userId) })
      .select('puzzleId')
      .exec();
    
    const attemptedPuzzleIds = attemptedPuzzles.map(solve => solve.puzzleId);

    // 3. Comprehensive evaluation for first 10 puzzles
    if (userStats.totalPuzzlesAttempted < 10) {
      return await this.getCalibrationPuzzle(userStats, attemptedPuzzleIds);
    }

    // 4. Progressive search with expanding range for experienced users
    const percentageSteps = [0.05, 0.10, 0.15, 0.20, 0.30, 0.50, 0.75, 1.00]; // 5% to 100%
    
    for (const percentage of percentageSteps) {
      // Calculate range for this percentage
      const ratingRange = Math.round(userStats.puzzleRating * percentage);
      const currentMinRating = (userStats.puzzleRating - ratingRange);
      const currentMaxRating = (userStats.puzzleRating + ratingRange);
      
      let puzzle = await this.puzzleModel
        .findOne({
          _id: { $nin: attemptedPuzzleIds },
          Rating: { 
            $gte: currentMinRating.toString(), 
            $lte: currentMaxRating.toString() 
          }
        })
        .exec();

      if (puzzle) {
        return puzzle;
      }
    }

    // If no puzzle found even with 100% range, throw error
    throw new NotFoundException('No puzzles available. You may have solved all puzzles in your rating range.');
  }

  private async getCalibrationPuzzle(userStats: any, attemptedPuzzleIds: any[]): Promise<Puzzle | null> {
    const puzzlesAttempted = userStats.totalPuzzlesAttempted;
    const recentAttempts = await this.userPuzzleSolveModel
      .find({ userId: userStats.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    // Define calibration strategy based on attempt number and recent performance
    let targetRating: number;
    let ratingRange: number;

    if (puzzlesAttempted === 0) {
      // First puzzle: Start with medium difficulty
      targetRating = 1500;
      ratingRange = 100;
    } else if (puzzlesAttempted === 1) {
      // Second puzzle: Based on first attempt result
      const lastAttempt = recentAttempts[0];
      if (lastAttempt.success) {
        // If solved, try harder puzzle
        targetRating = lastAttempt.puzzleRating + 200;
        ratingRange = 100;
      } else {
        // If failed, try easier puzzle
        targetRating = lastAttempt.puzzleRating - 200;
        ratingRange = 100;
      }
    } else if (puzzlesAttempted < 5) {
      // Early calibration: Large steps based on recent performance
      const successRate = recentAttempts.filter(attempt => attempt.success).length / recentAttempts.length;
      const avgRating = recentAttempts.reduce((sum, attempt) => sum + attempt.puzzleRating, 0) / recentAttempts.length;
      
      if (successRate >= 0.8) {
        // High success rate: Increase difficulty significantly
        targetRating = avgRating + 300;
        ratingRange = 150;
      } else if (successRate >= 0.6) {
        // Moderate success rate: Increase difficulty moderately
        targetRating = avgRating + 150;
        ratingRange = 100;
      } else if (successRate >= 0.4) {
        // Low success rate: Keep similar difficulty
        targetRating = avgRating;
        ratingRange = 100;
      } else {
        // Very low success rate: Decrease difficulty significantly
        targetRating = avgRating - 300;
        ratingRange = 150;
      }
    } else {
      // Later calibration (5-9): Fine-tune based on performance trends
      const successRate = recentAttempts.filter(attempt => attempt.success).length / recentAttempts.length;
      const avgRating = recentAttempts.reduce((sum, attempt) => sum + attempt.puzzleRating, 0) / recentAttempts.length;
      
      if (successRate >= 0.7) {
        targetRating = avgRating + 100;
        ratingRange = 75;
      } else if (successRate >= 0.5) {
        targetRating = avgRating + 50;
        ratingRange = 50;
      } else if (successRate >= 0.3) {
        targetRating = avgRating - 50;
        ratingRange = 50;
      } else {
        targetRating = avgRating - 150;
        ratingRange = 75;
      }
    }

    // Ensure rating stays within reasonable bounds
    targetRating = Math.max(800, Math.min(2400, targetRating));
    
    // Find puzzle in target range
    let puzzle = await this.puzzleModel
      .findOne({
        _id: { $nin: attemptedPuzzleIds },
        Rating: { 
          $gte: (targetRating - ratingRange).toString(), 
          $lte: (targetRating + ratingRange).toString() 
        }
      })
      .exec();

    // If no puzzle in target range, try broader range
    if (!puzzle) {
      puzzle = await this.puzzleModel
        .findOne({
          _id: { $nin: attemptedPuzzleIds },
          Rating: { 
            $gte: (targetRating - ratingRange * 2).toString(), 
            $lte: (targetRating + ratingRange * 2).toString() 
          }
        })
        .exec();
    }

    // If still no puzzle, try any unattempted puzzle
    if (!puzzle) {
      puzzle = await this.puzzleModel
        .findOne({
          _id: { $nin: attemptedPuzzleIds }
        })
        .exec();
    }

    if (!puzzle) {
      throw new NotFoundException('No puzzles available for calibration.');
    }

    return puzzle;
  }
}

