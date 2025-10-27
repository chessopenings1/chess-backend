import { Injectable, Logger } from '@nestjs/common';
import { AnalyzePositionDto } from './dto/analyze-position.dto';
import axios, { AxiosResponse } from 'axios';

export interface BestMove {
  move: string;
  score: number;
  depth: number;
  mate?: number; // If mate in X moves
}

export interface AnalysisResult {
  bestMove: string;
  score: number;
  depth: number;
  mate?: number;
  pv: string[]; // Principal variation (sequence of best moves)
}

interface ChessApiResponse {
  text: string;
  eval: number;
  move: string;
  fen: string;
  depth: number;
  winChance: number;
  continuationArr: string[];
  mate: number | null;
  centipawns: string;
  san: string;
  lan: string;
  turn: string;
  color: string;
  piece: string;
  flags: string;
  from: string;
  to: string;
  fromNumeric: string;
  toNumeric: string;
  taskId: string;
  time: number;
  type: string;
}

@Injectable()
export class StockfishService {
  private readonly logger = new Logger(StockfishService.name);
  private readonly chessApiUrl = 'https://chess-api.com/v1';

  constructor() {
    this.logger.log('Chess-API.com service initialized');
  }

  async analyzePosition(analyzeDto: AnalyzePositionDto): Promise<any> {
    try {
      const { fen, depth = 15, searchMoves } = analyzeDto;

      this.logger.debug(`Analyzing position: ${fen} at depth ${depth}`);

      const response: AxiosResponse<ChessApiResponse> = await axios.post(this.chessApiUrl, {
        fen: fen,
        depth: Math.min(depth, 18), // Chess-API max depth is 18
        maxThinkingTime: 50, // 50ms max thinking time
        searchMoves: searchMoves || '',
        variants: 3
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      const data = response.data;
      // return data
      
      console.log(data);
      
      // Convert centipawns to score
      const score = parseFloat(data.centipawns) / 100;
      
      // Extract mate information
      const mate = data.mate;
      
      // Convert continuation array to principal variation
      const pv = data.continuationArr || [];

      this.logger.debug(`Analysis complete: ${data.move} (${data.san}) - Score: ${score}`);

      return {
        bestMove: data.move,
        score: score,
        depth: data.depth,
        mate: mate || undefined,
        pv: pv
      };
    } catch (error) {
      this.logger.error('Error analyzing position with Chess-API:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          this.logger.error(`Chess-API error: ${error.response.status} - ${error.response.data}`);
        } else if (error.request) {
          this.logger.error('Chess-API request failed - no response received');
        }
      }
      throw new Error('Failed to analyze position with Chess-API');
    }
  }

  async getBestMove(fen: string, depth: number = 15): Promise<string> {
    const result = await this.analyzePosition({ fen, depth });
    return result.bestMove;
  }

  async evaluatePosition(fen: string, depth: number = 15): Promise<number> {
    const result = await this.analyzePosition({ fen, depth });
    return result.score;
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Test with a simple position
      const testFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      await this.getBestMove(testFen, 1);
      this.logger.log('Chess-API health check passed');
      return true;
    } catch (error) {
      this.logger.error('Chess-API health check failed:', error);
      return false;
    }
  }

  onModuleDestroy(): void {
    this.logger.log('Chess-API service destroyed');
  }
}