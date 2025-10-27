import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class AnalyzePositionDto {
  @IsString()
  @IsNotEmpty()
  fen: string; // FEN notation of the chess position

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(20)
  depth?: number; // Analysis depth (default: 15, max: 20)

  @IsString()
  @IsOptional()
  searchMoves?: string; // Color to analyze (default: 'white')
}
