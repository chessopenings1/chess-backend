import { Injectable } from '@nestjs/common';
import { Chess, Move, Square } from 'chess.js';
import { ChessOpening, ChessMove, getOpeningById, getAllOpenings, getOpeningsByCategory, getOpeningsByDifficulty } from './data/opening-data';

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
export class ChessService {
  private games: Map<string, Chess> = new Map();

  createGame(gameId: string): GameState {
    const chess = new Chess();
    this.games.set(gameId, chess);
    return this.getGameState(gameId);
  }

  getGameState(gameId: string): GameState {
    const chess = this.games.get(gameId);
    if (!chess) {
      throw new Error('Game not found');
    }

    return {
      fen: chess.fen(),
      moves: chess.history(),
      isGameOver: chess.isGameOver(),
      result: chess.isGameOver() ? chess.isCheckmate() ? 'checkmate' : chess.isDraw() ? 'draw' : 'stalemate' : null,
      turn: chess.turn() === 'w' ? 'w' : 'b',
    };
  }

  makeMove(gameId: string, move: string): MoveValidation {
    const chess = this.games.get(gameId);
    if (!chess) {
      return { isValid: false, error: 'Game not found' };
    }

    try {
      const result = chess.move(move);
      if (result) {
        return {
          isValid: true,
          newGameState: this.getGameState(gameId),
        };
      } else {
        return { isValid: false, error: 'Invalid move' };
      }
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }

  resetGame(gameId: string): GameState {
    const chess = new Chess();
    this.games.set(gameId, chess);
    return this.getGameState(gameId);
  }

  loadOpening(gameId: string, openingId: string): { success: boolean; error?: string; gameState?: GameState } {
    const opening = getOpeningById(openingId);
    if (!opening) {
      return { success: false, error: 'Opening not found' };
    }

    const chess = new Chess();
    this.games.set(gameId, chess);

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

    return { success: true, gameState: this.getGameState(gameId) };
  }

  getOpeningById(id: string): ChessOpening | undefined {
    return getOpeningById(id);
  }

  getAllOpenings(): ChessOpening[] {
    return getAllOpenings();
  }

  getOpeningsByCategory(category: string): ChessOpening[] {
    return getOpeningsByCategory(category);
  }

  getOpeningsByDifficulty(difficulty: string): ChessOpening[] {
    return getOpeningsByDifficulty(difficulty);
  }

  deleteGame(gameId: string): boolean {
    return this.games.delete(gameId);
  }

  getGameHistory(gameId: string): string[] {
    const chess = this.games.get(gameId);
    if (!chess) {
      throw new Error('Game not found');
    }
    return chess.history();
  }

  getPossibleMoves(gameId: string, square?: Square): string[] {
    const chess = this.games.get(gameId);
    if (!chess) {
      throw new Error('Game not found');
    }

    if (square) {
      return chess.moves({ square, verbose: true }).map((move: Move) => move.san);
    }
    return chess.moves();
  }
}
