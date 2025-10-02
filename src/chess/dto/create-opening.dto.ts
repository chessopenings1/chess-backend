import { IsString, IsArray, IsNumber, IsNotEmpty, ArrayMinSize, Min, Max, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsValidChessMoves } from '../validators/chess-moves.validator';

export class CreateChessOpeningDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  difficulty: number;

  @IsString()
  @IsIn(['white', 'black'])
  player: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsValidChessMoves()
  moves: string[];
}
