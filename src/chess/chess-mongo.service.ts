import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chess, Move, Square } from 'chess.js';
import { ChessOpening, ChessOpeningDocument } from './schemas/chess-opening.schema';
import { GameSession, GameSessionDocument } from './schemas/game-session.schema';

export interface GameState {
  fen: string;
  moves: string[];
  isGameOver: boolean;
  result: string | null;
  turn: 'w' | 'b';
}

export interface MoveValidation {
  isValid: boolean;
  error?: string;
  newGameState?: GameState;
}

@Injectable()
export class ChessMongoService {
  constructor(
    @InjectModel(ChessOpening.name) private chessOpeningModel: Model<ChessOpeningDocument>,
    @InjectModel(GameSession.name) private gameSessionModel: Model<GameSessionDocument>,
  ) {}

  async createGame(gameId: string): Promise<GameState> {
    const chess = new Chess();
    const gameState = this.chessToGameState(chess);
    
    const gameSession = new this.gameSessionModel({
      gameId,
      fen: gameState.fen,
      moves: gameState.moves,
      isGameOver: gameState.isGameOver,
      result: gameState.result,
      turn: gameState.turn,
      currentMoveIndex: 0,
    });

    await gameSession.save();
    return gameState;
  }

  async getGameState(gameId: string): Promise<GameState> {
    const gameSession = await this.gameSessionModel.findOne({ gameId });
    if (!gameSession) {
      throw new Error('Game not found');
    }

    return {
      fen: gameSession.fen,
      moves: gameSession.moves,
      isGameOver: gameSession.isGameOver,
      result: gameSession.result || null,
      turn: gameSession.turn as 'w' | 'b',
    };
  }

  async makeMove(gameId: string, move: string): Promise<MoveValidation> {
    const gameSession = await this.gameSessionModel.findOne({ gameId });
    if (!gameSession) {
      return { isValid: false, error: 'Game not found' };
    }

    try {
      const chess = new Chess(gameSession.fen);
      const result = chess.move(move);
      
      if (result) {
        const newGameState = this.chessToGameState(chess);
        
        // Update the game session
        await this.gameSessionModel.findOneAndUpdate(
          { gameId },
          {
            fen: newGameState.fen,
            moves: newGameState.moves,
            isGameOver: newGameState.isGameOver,
            result: newGameState.result,
            turn: newGameState.turn,
            currentMoveIndex: newGameState.moves.length,
          }
        );

        return {
          isValid: true,
          newGameState,
        };
      } else {
        return { isValid: false, error: 'Invalid move' };
      }
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }

  async resetGame(gameId: string): Promise<GameState> {
    const chess = new Chess();
    const gameState = this.chessToGameState(chess);
    
    await this.gameSessionModel.findOneAndUpdate(
      { gameId },
      {
        fen: gameState.fen,
        moves: gameState.moves,
        isGameOver: gameState.isGameOver,
        result: gameState.result,
        turn: gameState.turn,
        currentMoveIndex: 0,
        openingId: null,
        lastMoveFrom: null,
        lastMoveTo: null,
      },
      { upsert: true }
    );

    return gameState;
  }

  async loadOpening(gameId: string, openingId: string): Promise<{ success: boolean; error?: string; gameState?: GameState }> {
    const opening = await this.chessOpeningModel.findOne({ id: openingId });
    if (!opening) {
      return { success: false, error: 'Opening not found' };
    }

    const chess = new Chess();

    // Apply all moves from the opening
    for (const move of opening.moves) {
      try {
        const result = chess.move(move.move);
        if (!result) {
          return { success: false, error: `Invalid move in opening: ${move.move}` };
        }
      } catch (error) {
        return { success: false, error: `Error applying move ${move.move}: ${error.message}` };
      }
    }

    const gameState = this.chessToGameState(chess);
    
    // Update the game session
    await this.gameSessionModel.findOneAndUpdate(
      { gameId },
      {
        fen: gameState.fen,
        moves: gameState.moves,
        isGameOver: gameState.isGameOver,
        result: gameState.result,
        turn: gameState.turn,
        currentMoveIndex: gameState.moves.length,
        openingId: openingId,
      },
      { upsert: true }
    );

    return { success: true, gameState };
  }

  async getOpeningById(id: string): Promise<ChessOpening | null> {
    return await this.chessOpeningModel.findOne({ id });
  }

  async getAllOpenings(): Promise<ChessOpening[]> {
    return await this.chessOpeningModel.find().exec();
  }

  async getOpeningsByCategory(category: string): Promise<ChessOpening[]> {
    return await this.chessOpeningModel.find({ category }).exec();
  }

  async getOpeningsByDifficulty(difficulty: string): Promise<ChessOpening[]> {
    return await this.chessOpeningModel.find({ difficulty }).exec();
  }

  async deleteGame(gameId: string): Promise<boolean> {
    const result = await this.gameSessionModel.deleteOne({ gameId });
    return result.deletedCount > 0;
  }

  async getGameHistory(gameId: string): Promise<string[]> {
    const gameSession = await this.gameSessionModel.findOne({ gameId });
    if (!gameSession) {
      throw new Error('Game not found');
    }
    return gameSession.moves;
  }

  async getPossibleMoves(gameId: string, square?: Square): Promise<string[]> {
    const gameSession = await this.gameSessionModel.findOne({ gameId });
    if (!gameSession) {
      throw new Error('Game not found');
    }

    const chess = new Chess(gameSession.fen);

    if (square) {
      return chess.moves({ square, verbose: true }).map((move: Move) => move.san);
    }
    return chess.moves();
  }

  private chessToGameState(chess: Chess): GameState {
    return {
      fen: chess.fen(),
      moves: chess.history(),
      isGameOver: chess.isGameOver(),
      result: chess.isGameOver() ? chess.isCheckmate() ? 'checkmate' : chess.isDraw() ? 'draw' : 'stalemate' : null,
      turn: chess.turn() === 'w' ? 'w' : 'b',
    };
  }
}
