import { IsString, IsNotEmpty, IsEnum, IsMongoId, IsNumber, Min } from 'class-validator';

export class CourseItemDto {
  @IsEnum(['lesson', 'puzzle'])
  @IsNotEmpty()
  type: string;

  @IsMongoId()
  @IsNotEmpty()
  itemId: string;

  @IsNumber()
  @Min(0)
  order: number;
}

