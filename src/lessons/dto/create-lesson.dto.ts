import { IsString, IsNotEmpty, IsArray, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { MoveDto } from './move.dto';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  starting_fen: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MoveDto)
  @IsOptional()
  moves?: MoveDto[];

  @IsEnum(['black', 'white'])
  @IsNotEmpty()
  turn: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prompts?: string[];
}

