import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { PuzzlesService } from './puzzles.service';
import { PuzzleSolveService } from './puzzle-solve.service';
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { SolvePuzzleDto } from './dto/solve-puzzle.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  name: string;
}

@Controller('puzzles')
@UseGuards(JwtAuthGuard)  // Apply JWT authentication to all routes
export class PuzzlesController {
  constructor(
    private readonly puzzlesService: PuzzlesService,
    private readonly puzzleSolveService: PuzzleSolveService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPuzzleDto: CreatePuzzleDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const puzzle = await this.puzzlesService.create(createPuzzleDto);
    return {
      success: true,
      data: puzzle,
      message: 'Puzzle created successfully',
      user: { id: user.userId }
    };
  }

  @Get('foo')
  async updateAllThemes(
    @Query('page') page: string = '1',
    @GetUser() user: AuthenticatedUser,
  ) {
    const result = await this.puzzlesService.foo();
    return {
      success: true,
      data: result,
      user: { id: user.userId }
    };
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @GetUser() user: AuthenticatedUser,
  ) {
    const pageNumber = parseInt(page) || 1;
    const result = await this.puzzlesService.findAll(pageNumber, 1000);
    return {
      success: true,
      data: result.puzzles,
      pagination: {
        page: result.page,
        limit: 1000,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1
      },
      user: { id: user.userId }
    };
  }

  @Get('opening')
  async findOpeningPuzzles(@GetUser() user: AuthenticatedUser) {
    const puzzles = await this.puzzlesService.findOpeningPuzzles();
    return {
      success: true,
      data: puzzles,
      count: puzzles.length,
      user: { id: user.userId }
    };
  }

  @Get('rating')
  async findByRatingRange(
    @Query('min') min: string,
    @Query('max') max: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const minRating = parseInt(min) || 0;
    const maxRating = parseInt(max) || 3000;
    const puzzles = await this.puzzlesService.findByRatingRange(minRating, maxRating);
    return {
      success: true,
      data: puzzles,
      count: puzzles.length,
      user: { id: user.userId }
    };
  }

  @Get('theme/:theme')
  async findByTheme(
    @Param('theme') theme: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const puzzles = await this.puzzlesService.findByTheme(theme);
    return {
      success: true,
      data: puzzles,
      count: puzzles.length,
      user: { id: user.userId }
    };
  }

  @Get('puzzle-id/:puzzleId')
  async findByPuzzleId(
    @Param('puzzleId') puzzleId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const puzzle = await this.puzzlesService.findByPuzzleId(puzzleId);
    return {
      success: true,
      data: puzzle,
      user: { id: user.userId }
    };
  }

  @Get('next')
  async getRecommendedPuzzle(@GetUser() user: AuthenticatedUser) {
    const puzzle = await this.puzzleSolveService.getRecommendedPuzzle(user.userId);
    
    if (!puzzle) {
      return {
        success: false,
        message: 'No puzzles available. You may have solved all puzzles in your rating range.',
        data: null,
        user: { id: user.userId }
      };
    }

    return {
      success: true,
      data: puzzle,
      user: { id: user.userId }
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const puzzle = await this.puzzlesService.findOne(id);
    return {
      success: true,
      data: puzzle,
      user: { id: user.userId }
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePuzzleDto: UpdatePuzzleDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const puzzle = await this.puzzlesService.update(id, updatePuzzleDto);
    return {
      success: true,
      data: puzzle,
      message: 'Puzzle updated successfully',
      user: { id: user.userId }
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    await this.puzzlesService.remove(id);
    return {
      success: true,
      message: 'Puzzle deleted successfully',
      user: { id: user.userId }
    };
  }

  @Post('solve')
  @HttpCode(HttpStatus.OK)
  async solvePuzzle(
    @Body() solvePuzzleDto: SolvePuzzleDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const result = await this.puzzleSolveService.solvePuzzle(user.userId, solvePuzzleDto);
    return result;
  }

  @Get('my-stats')
  async getMyStats(@GetUser() user: AuthenticatedUser) {
    const stats = await this.puzzleSolveService.getUserStats(user.userId);
    return {
      success: true,
      data: stats,
      user: { id: user.userId }
    };
  }

  @Get('my-history')
  async getMyHistory(
    @Query('limit') limit: string = '50',
    @GetUser() user: AuthenticatedUser,
  ) {
    const limitNumber = parseInt(limit) || 50;
    const history = await this.puzzleSolveService.getUserSolveHistory(user.userId, limitNumber);
    return {
      success: true,
      data: history,
      count: history.length,
      user: { id: user.userId }
    };
  }

  @Get(':puzzleId/solved')
  async checkIfSolved(
    @Param('puzzleId') puzzleId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const solved = await this.puzzleSolveService.hasUserSolvedPuzzle(user.userId, puzzleId);
    return {
      success: true,
      data: { solved },
      user: { id: user.userId }
    };
  }

  @Get(':puzzleId/solve-count')
  async getPuzzleSolveCount(@Param('puzzleId') puzzleId: string) {
    const count = await this.puzzleSolveService.getPuzzleSolveCount(puzzleId);
    return {
      success: true,
      data: { solveCount: count }
    };
  }

}

