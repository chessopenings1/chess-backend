import { IsString, IsArray, IsNotEmpty, ArrayMinSize, IsIn, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsValidChessMoves } from '../validators/chess-moves.validator';

export class CreateChessOpeningDto {
  @IsString()
  @IsNotEmpty()
  Opening: string;

  @IsString()
  @IsIn(['white', 'black'])
  Colour: string;

  @IsString()
  @IsNotEmpty()
  'Num Games': string;

  @IsString()
  @IsNotEmpty()
  'Perf Rating': string;

  @IsString()
  @IsNotEmpty()
  'Avg Player': string;

  @IsString()
  @IsNotEmpty()
  'Player Win %': string;

  @IsString()
  @IsNotEmpty()
  'Draw %': string;

  @IsString()
  @IsNotEmpty()
  'Opponent Win %': string;

  @IsString()
  @IsNotEmpty()
  Moves: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsValidChessMoves()
  moves_list: string[];

  @IsString()
  @IsNotEmpty()
  'White_win%': string;

  @IsString()
  @IsNotEmpty()
  'Black_win%': string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  slug: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
