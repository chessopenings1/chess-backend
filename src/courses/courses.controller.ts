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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateCourseWithLessonsDto } from './dto/create-course-with-lessons.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  async create(@Body(ValidationPipe) createCourseDto: CreateCourseDto) {
    const course = await this.coursesService.create(createCourseDto);
    return {
      success: true,
      message: 'Course created successfully',
      data: course,
    };
  }

  @Post('with-lessons')
  async createWithLessons(
    @Body(ValidationPipe) createCourseWithLessonsDto: CreateCourseWithLessonsDto,
  ) {
    const course = await this.coursesService.createWithLessons(
      createCourseWithLessonsDto,
    );
    return {
      success: true,
      message: 'Course and lessons created successfully',
      data: course,
    };
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('tags') tags?: string,
    @Query('type') type?: string,
    @Query('difficulty') difficulty?: string,
  ) {
    const tagsArray = tags ? tags.split(',') : undefined;
    const result = await this.coursesService.findAll(
      page,
      limit,
      tagsArray,
      type,
      difficulty,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const course = await this.coursesService.findOne(id);
    return {
      success: true,
      data: course,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateCourseDto: UpdateCourseDto,
  ) {
    const course = await this.coursesService.update(id, updateCourseDto);
    return {
      success: true,
      message: 'Course updated successfully',
      data: course,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.coursesService.remove(id);
    return {
      success: true,
      message: 'Course deleted successfully',
    };
  }

  @Post(':id/items')
  async addItem(
    @Param('id') id: string,
    @Body('type') type: 'lesson' | 'puzzle',
    @Body('itemId') itemId: string,
  ) {
    const course = await this.coursesService.addItem(id, type, itemId);
    return {
      success: true,
      message: 'Item added to course successfully',
      data: course,
    };
  }

  @Delete(':id/items/:type/:itemId')
  async removeItem(
    @Param('id') id: string,
    @Param('type') type: 'lesson' | 'puzzle',
    @Param('itemId') itemId: string,
  ) {
    const course = await this.coursesService.removeItem(id, type, itemId);
    return {
      success: true,
      message: 'Item removed from course successfully',
      data: course,
    };
  }

  @Patch(':id/items/reorder')
  async reorderItems(
    @Param('id') id: string,
    @Body('items') items: Array<{ itemId: string; type: 'lesson' | 'puzzle'; order: number }>,
  ) {
    const course = await this.coursesService.reorderItems(id, items);
    return {
      success: true,
      message: 'Items reordered successfully',
      data: course,
    };
  }
}
