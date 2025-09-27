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
  async createGame(@Body() body: { gameId: string }) {
    const gameState = await this.chessMongoService.createGame(body.gameId);
    return {
      success: true,
      data: gameState
    };
  }

  @Get('game/:gameId')
  async getGameState(@Param('gameId') gameId: string) {
    const gameState = await this.chessMongoService.getGameState(gameId);
    return {
      success: true,
      data: gameState
    };
  }

  @Put('game/:gameId/move')
  async makeMove(
    @Param('gameId') gameId: string,
    @Body() body: { move: string },
  ) {
    const result = await this.chessMongoService.makeMove(gameId, body.move);
    return {
      success: result.isValid,
      data: result
    };
  }

  @Put('game/:gameId/reset')
  async resetGame(@Param('gameId') gameId: string) {
    const gameState = await this.chessMongoService.resetGame(gameId);
    return {
      success: true,
      data: gameState
    };
  }

  @Post('game/:gameId/opening/:openingId')
  async loadOpening(
    @Param('gameId') gameId: string,
    @Param('openingId') openingId: string,
  ) {
    const result = await this.chessMongoService.loadOpening(gameId, openingId);
    return {
      success: result.success,
      data: result
    };
  }

  @Get('openings')
  async getAllOpenings() {
    const openings = await this.chessMongoService.getAllOpenings();
    return {
      success: true,
      data: openings
    };
  }

  @Get('openings/:id')
  async getOpeningById(@Param('id') id: string) {
    const opening = await this.chessMongoService.getOpeningById(id);
    return {
      success: true,
      data: opening
    };
  }

  @Get('openings/category/:category')
  async getOpeningsByCategory(@Param('category') category: string) {
    const openings = await this.chessMongoService.getOpeningsByCategory(category);
    return {
      success: true,
      data: openings
    };
  }

  @Get('openings/difficulty/:difficulty')
  async getOpeningsByDifficulty(@Param('difficulty') difficulty: string) {
    const openings = await this.chessMongoService.getOpeningsByDifficulty(difficulty);
    return {
      success: true,
      data: openings
    };
  }

  @Delete('game/:gameId')
  async deleteGame(@Param('gameId') gameId: string) {
    const deleted = await this.chessMongoService.deleteGame(gameId);
    return {
      success: deleted,
      data: { deleted }
    };
  }

  @Get('game/:gameId/history')
  async getGameHistory(@Param('gameId') gameId: string) {
    const history = await this.chessMongoService.getGameHistory(gameId);
    return {
      success: true,
      data: history
    };
  }

  @Get('game/:gameId/moves')
  async getPossibleMoves(
    @Param('gameId') gameId: string,
    @Query('square') square?: Square,
  ) {
    const moves = await this.chessMongoService.getPossibleMoves(gameId, square);
    return {
      success: true,
      data: moves
    };
  }

  @Post('seed')
  async seedDatabase() {
    await this.seedService.seedOpenings();
    return {
      success: true,
      message: 'Database seeded successfully!'
    };
  }
}
