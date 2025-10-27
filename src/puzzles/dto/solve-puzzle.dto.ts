import { IsString, IsBoolean, IsNumber, IsNotEmpty, Min, IsOptional } from 'class-validator';

export class SolvePuzzleDto {
  @IsString()
  @IsNotEmpty()
  puzzleId: string; // MongoDB ObjectId of the puzzle

  @IsNumber()
  @Min(0)
  success: number; // 0 (lose), 1 (win), 0.5 (draw)

  @IsNumber()
  @Min(0)
  timeSpent: number; // Time spent in seconds

  @IsNumber()
  @IsOptional()
  @Min(1)
  attemptsMade?: number; // Number of attempts before solving
}

