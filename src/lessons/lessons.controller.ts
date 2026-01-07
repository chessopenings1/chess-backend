import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  async create(@Body(ValidationPipe) createLessonDto: CreateLessonDto) {
    const lesson = await this.lessonsService.create(createLessonDto);
    return {
      success: true,
      message: 'Lesson created successfully',
      data: lesson,
    };
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('tags') tags?: string,
  ) {
    const tagsArray = tags ? tags.split(',') : undefined;
    const result = await this.lessonsService.findAll(page, limit, tagsArray);
    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const lesson = await this.lessonsService.findOne(id);
    return {
      success: true,
      data: lesson,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateLessonDto: UpdateLessonDto,
  ) {
    const lesson = await this.lessonsService.update(id, updateLessonDto);
    return {
      success: true,
      message: 'Lesson updated successfully',
      data: lesson,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.lessonsService.remove(id);
    return {
      success: true,
      message: 'Lesson deleted successfully',
    };
  }
}

