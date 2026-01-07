import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLessonDto } from '../../lessons/dto/create-lesson.dto';

export class CreateCourseWithLessonsDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  difficulty: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  @IsNotEmpty()
  lessons: CreateLessonDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prompts?: string[];
}
