import { Controller, Post, Body, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { StockfishService } from './stockfish.service';
import { AnalyzePositionDto } from './dto/analyze-position.dto';

@Controller('stockfish')
export class StockfishController {
  constructor(private readonly stockfishService: StockfishService) {}

  @Post('analyze')
  async analyzePosition(@Body() analyzeDto: AnalyzePositionDto) {
    try {
      const result = await this.stockfishService.analyzePosition(analyzeDto);
      
      return {
        success: true,
        data: {
          position: analyzeDto.fen,
          analysis: result
        }
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to analyze position',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('best-move')
  async getBestMove(@Body() analyzeDto: AnalyzePositionDto) {
    try {
      const bestMove = await this.stockfishService.getBestMove(analyzeDto.fen, analyzeDto.depth);
      
      return {
        success: true,
        data: {
          position: analyzeDto.fen,
          bestMove: bestMove
        }
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get best move',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('evaluate')
  async evaluatePosition(@Body() analyzeDto: AnalyzePositionDto) {
    try {
      const score = await this.stockfishService.evaluatePosition(analyzeDto.fen, analyzeDto.depth);
      
      return {
        success: true,
        data: {
          position: analyzeDto.fen,
          evaluation: score
        }
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to evaluate position',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('health')
  async healthCheck() {
    try {
      const isHealthy = await this.stockfishService.healthCheck();
      
      if (isHealthy) {
        return {
          success: true,
          message: 'Chess-API.com is running properly'
        };
      } else {
        throw new Error('Chess-API.com health check failed');
      }
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Chess-API.com is not responding',
          error: error.message
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
}
