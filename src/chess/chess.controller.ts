import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import type { GameState, MoveValidation } from './chess-mongo.service';
import { ChessMongoService } from './chess-mongo.service';
import { SeedService } from './seed.service';
import type { ChessOpening } from './schemas/chess-opening.schema';
import type { Square } from 'chess.js';

@Controller('chess')
export class ChessController {
  constructor(
    private readonly chessMongoService: ChessMongoService,
    private readonly seedService: SeedService,
  ) {}

  @Post('game')
  async createGame(@Body() body: { gameId: string }): Promise<GameState> {
    return await this.chessMongoService.createGame(body.gameId);
  }

  @Get('game/:gameId')
  async getGameState(@Param('gameId') gameId: string): Promise<GameState> {
    return await this.chessMongoService.getGameState(gameId);
  }

  @Put('game/:gameId/move')
  async makeMove(
    @Param('gameId') gameId: string,
    @Body() body: { move: string },
  ): Promise<MoveValidation> {
    return await this.chessMongoService.makeMove(gameId, body.move);
  }

  @Put('game/:gameId/reset')
  async resetGame(@Param('gameId') gameId: string): Promise<GameState> {
    return await this.chessMongoService.resetGame(gameId);
  }

  @Post('game/:gameId/opening/:openingId')
  async loadOpening(
    @Param('gameId') gameId: string,
    @Param('openingId') openingId: string,
  ): Promise<{ success: boolean; error?: string; gameState?: GameState }> {
    return await this.chessMongoService.loadOpening(gameId, openingId);
  }

  @Get('openings')
  async getAllOpenings(): Promise<ChessOpening[]> {
    return await this.chessMongoService.getAllOpenings();
  }

  @Get('openings/:id')
  async getOpeningById(@Param('id') id: string): Promise<ChessOpening | null> {
    return await this.chessMongoService.getOpeningById(id);
  }

  @Get('openings/category/:category')
  async getOpeningsByCategory(@Param('category') category: string): Promise<ChessOpening[]> {
    return await this.chessMongoService.getOpeningsByCategory(category);
  }

  @Get('openings/difficulty/:difficulty')
  async getOpeningsByDifficulty(@Param('difficulty') difficulty: string): Promise<ChessOpening[]> {
    return await this.chessMongoService.getOpeningsByDifficulty(difficulty);
  }

  @Delete('game/:gameId')
  async deleteGame(@Param('gameId') gameId: string): Promise<{ success: boolean }> {
    const deleted = await this.chessMongoService.deleteGame(gameId);
    return { success: deleted };
  }

  @Get('game/:gameId/history')
  async getGameHistory(@Param('gameId') gameId: string): Promise<string[]> {
    return await this.chessMongoService.getGameHistory(gameId);
  }

  @Get('game/:gameId/moves')
  async getPossibleMoves(
    @Param('gameId') gameId: string,
    @Query('square') square?: Square,
  ): Promise<string[]> {
    return await this.chessMongoService.getPossibleMoves(gameId, square);
  }

  @Post('seed')
  async seedDatabase(): Promise<{ message: string }> {
    await this.seedService.seedOpenings();
    return { message: 'Database seeded successfully!' };
  }
}
