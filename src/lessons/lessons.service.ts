import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    try {
      const createdLesson = new this.lessonModel({
        ...createLessonDto,
        tags: createLessonDto.tags || [],
        moves: createLessonDto.moves || [],
        prompts: createLessonDto.prompts || [],
      });
      return await createdLesson.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Lesson with this name already exists');
      }
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    tags?: string[],
  ): Promise<{
    lessons: Lesson[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    const [lessons, total] = await Promise.all([
      this.lessonModel.find(query).skip(skip).limit(limit).exec(),
      this.lessonModel.countDocuments(query).exec(),
    ]);

    return {
      lessons,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonModel.findById(id).exec();
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID "${id}" not found`);
    }
    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.lessonModel
      .findByIdAndUpdate(id, updateLessonDto, { new: true })
      .exec();

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID "${id}" not found`);
    }

    return lesson;
  }

  async remove(id: string): Promise<void> {
    const result = await this.lessonModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Lesson with ID "${id}" not found`);
    }
  }

  async findByTags(tags: string[]): Promise<Lesson[]> {
    return this.lessonModel.find({ tags: { $in: tags } }).exec();
  }
}

