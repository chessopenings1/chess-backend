import { IsString, IsArray, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreatePuzzleDto {
  @IsString()
  @IsNotEmpty()
  PuzzleId: string;

  @IsString()
  @IsNotEmpty()
  FEN: string;

  @IsString()
  @IsNotEmpty()
  Moves: string;

  @IsString()
  @IsNotEmpty()
  Rating: string;

  @IsString()
  @IsNotEmpty()
  RatingDeviation: string;

  @IsString()
  @IsNotEmpty()
  Popularity: string;

  @IsString()
  @IsNotEmpty()
  NbPlays: string;

  @IsArray()
  @IsString({ each: true })
  Themes: string[];

  @IsString()
  @IsNotEmpty()
  GameUrl: string;

  @IsString()
  @IsOptional()
  OpeningTags?: string;

  @IsBoolean()
  @IsOptional()
  isOpening?: boolean;
}

