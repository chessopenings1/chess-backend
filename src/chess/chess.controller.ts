import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import type { GameState, MoveValidation } from './chess.service';
import { ChessService } from './chess.service';
import type { ChessOpening } from './data/opening-data';
import type { Square } from 'chess.js';

@Controller('chess')
export class ChessController {
  constructor(private readonly chessService: ChessService) {}

  @Post('game')
  createGame(@Body() body: { gameId: string }): GameState {
    return this.chessService.createGame(body.gameId);
  }

  @Get('game/:gameId')
  getGameState(@Param('gameId') gameId: string): GameState {
    return this.chessService.getGameState(gameId);
  }

  @Put('game/:gameId/move')
  makeMove(
    @Param('gameId') gameId: string,
    @Body() body: { move: string },
  ): MoveValidation {
    return this.chessService.makeMove(gameId, body.move);
  }

  @Put('game/:gameId/reset')
  resetGame(@Param('gameId') gameId: string): GameState {
    return this.chessService.resetGame(gameId);
  }

  @Post('game/:gameId/opening/:openingId')
  loadOpening(
    @Param('gameId') gameId: string,
    @Param('openingId') openingId: string,
  ): { success: boolean; error?: string; gameState?: GameState } {
    return this.chessService.loadOpening(gameId, openingId);
  }

  @Get('openings')
  getAllOpenings(): ChessOpening[] {
    return this.chessService.getAllOpenings();
  }

  @Get('openings/:id')
  getOpeningById(@Param('id') id: string): ChessOpening | undefined {
    return this.chessService.getOpeningById(id);
  }

  @Get('openings/category/:category')
  getOpeningsByCategory(@Param('category') category: string): ChessOpening[] {
    return this.chessService.getOpeningsByCategory(category);
  }

  @Get('openings/difficulty/:difficulty')
  getOpeningsByDifficulty(@Param('difficulty') difficulty: string): ChessOpening[] {
    return this.chessService.getOpeningsByDifficulty(difficulty);
  }

  @Delete('game/:gameId')
  deleteGame(@Param('gameId') gameId: string): { success: boolean } {
    const deleted = this.chessService.deleteGame(gameId);
    return { success: deleted };
  }

  @Get('game/:gameId/history')
  getGameHistory(@Param('gameId') gameId: string): string[] {
    return this.chessService.getGameHistory(gameId);
  }

  @Get('game/:gameId/moves')
  getPossibleMoves(
    @Param('gameId') gameId: string,
    @Query('square') square?: Square,
  ): string[] {
    return this.chessService.getPossibleMoves(gameId, square);
  }
}
