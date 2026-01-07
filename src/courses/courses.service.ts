import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateCourseWithLessonsDto } from './dto/create-course-with-lessons.dto';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import { Puzzle, PuzzleDocument } from '../puzzles/schemas/puzzle.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Puzzle.name) private puzzleModel: Model<PuzzleDocument>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    try {
      // Validate items if provided
      if (createCourseDto.items && createCourseDto.items.length > 0) {
        await this.validateItems(createCourseDto.items);
      }

      const createdCourse = new this.courseModel({
        ...createCourseDto,
        tags: createCourseDto.tags || [],
        items: createCourseDto.items || [],
        prompts: createCourseDto.prompts || [],
      });
      return await createdCourse.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Course with this name already exists');
      }
      throw error;
    }
  }

  async createWithLessons(createCourseWithLessonsDto: CreateCourseWithLessonsDto): Promise<any> {
    try {
      // Step 1: Create all lessons first
      const createdLessons = await Promise.all(
        createCourseWithLessonsDto.lessons.map(async (lessonDto) => {
          const createdLesson = new this.lessonModel({
            ...lessonDto,
            tags: lessonDto.tags || [],
            moves: lessonDto.moves || [],
            prompts: lessonDto.prompts || [],
          });
          return await createdLesson.save();
        }),
      );

      // Step 2: Create course items array with lesson IDs
      const courseItems = createdLessons.map((lesson, index) => ({
        type: 'lesson',
        itemId: lesson._id,
        order: index,
      }));

      // Step 3: Create the course with the lesson IDs
      const createdCourse = new this.courseModel({
        name: createCourseWithLessonsDto.name,
        type: createCourseWithLessonsDto.type,
        difficulty: createCourseWithLessonsDto.difficulty,
        tags: createCourseWithLessonsDto.tags || [],
        items: courseItems,
        prompts: createCourseWithLessonsDto.prompts || [],
      });

      const savedCourse = await createdCourse.save();

      // Step 4: Return the course with populated lesson details
      return this.populateItems(savedCourse);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Course or lesson with this name already exists');
      }
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    tags?: string[],
    type?: string,
    difficulty?: string,
  ): Promise<{
    courses: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (type) {
      query.type = type;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    const [courses, total] = await Promise.all([
      this.courseModel.find(query).skip(skip).limit(limit).exec(),
      this.courseModel.countDocuments(query).exec(),
    ]);

    // Populate items based on type
    const populatedCourses = await Promise.all(
      courses.map((course) => this.populateItems(course)),
    );

    return {
      courses: populatedCourses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<any> {
    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }
    return this.populateItems(course);
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<any> {
    // Validate items if provided
    if (updateCourseDto.items && updateCourseDto.items.length > 0) {
      await this.validateItems(updateCourseDto.items);
    }

    const course = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();

    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }

    return this.populateItems(course);
  }

  async remove(id: string): Promise<void> {
    const result = await this.courseModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }
  }

  async addItem(
    courseId: string,
    itemType: 'lesson' | 'puzzle',
    itemId: string,
  ): Promise<any> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }

    // Validate item exists
    await this.validateItem(itemType, itemId);

    // Check if item already exists in course
    const existingItem = course.items.find(
      (item) =>
        item.type === itemType && item.itemId.toString() === itemId,
    );

    if (existingItem) {
      throw new ConflictException(
        `${itemType} with ID "${itemId}" already exists in this course`,
      );
    }

    // Get the next order number
    const maxOrder =
      course.items.length > 0
        ? Math.max(...course.items.map((item) => item.order))
        : -1;

    course.items.push({
      type: itemType,
      itemId: itemId as any,
      order: maxOrder + 1,
    });

    await course.save();

    return this.populateItems(course);
  }

  async removeItem(
    courseId: string,
    itemType: 'lesson' | 'puzzle',
    itemId: string,
  ): Promise<any> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }

    const initialLength = course.items.length;
    course.items = course.items.filter(
      (item) =>
        !(item.type === itemType && item.itemId.toString() === itemId),
    ) as any;

    if (course.items.length === initialLength) {
      throw new NotFoundException(
        `${itemType} with ID "${itemId}" not found in this course`,
      );
    }

    // Reorder remaining items
    course.items.forEach((item, index) => {
      item.order = index;
    });

    await course.save();

    return this.populateItems(course);
  }

  async reorderItems(
    courseId: string,
    itemOrders: Array<{ itemId: string; type: 'lesson' | 'puzzle'; order: number }>,
  ): Promise<any> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }

    // Validate all items exist in course
    for (const itemOrder of itemOrders) {
      const item = course.items.find(
        (i) =>
          i.type === itemOrder.type &&
          i.itemId.toString() === itemOrder.itemId,
      );
      if (!item) {
        throw new NotFoundException(
          `Item ${itemOrder.type}:${itemOrder.itemId} not found in course`,
        );
      }
    }

    // Update orders
    itemOrders.forEach((itemOrder) => {
      const item = course.items.find(
        (i) =>
          i.type === itemOrder.type &&
          i.itemId.toString() === itemOrder.itemId,
      );
      if (item) {
        item.order = itemOrder.order;
      }
    });

    // Sort items by order
    course.items.sort((a, b) => a.order - b.order);

    await course.save();

    return this.populateItems(course);
  }

  async findByTags(tags: string[]): Promise<any[]> {
    const courses = await this.courseModel
      .find({ tags: { $in: tags } })
      .exec();

    return Promise.all(courses.map((course) => this.populateItems(course)));
  }

  private async populateItems(course: CourseDocument): Promise<any> {
    const courseObj = course.toObject();
    const populatedItems = await Promise.all(
      course.items.map(async (item) => {
        let populatedItem: LessonDocument | PuzzleDocument | null = null;

        if (item.type === 'lesson') {
          populatedItem = await this.lessonModel.findById(item.itemId).exec();
        } else if (item.type === 'puzzle') {
          populatedItem = await this.puzzleModel.findById(item.itemId).exec();
        }

        return {
          type: item.type,
          itemId: item.itemId,
          order: item.order,
          item: populatedItem,
        };
      }),
    );

    // Sort by order
    populatedItems.sort((a, b) => a.order - b.order);

    return {
      ...courseObj,
      items: populatedItems,
    };
  }

  private async validateItem(
    type: 'lesson' | 'puzzle',
    itemId: string,
  ): Promise<void> {
    if (type === 'lesson') {
      const lesson = await this.lessonModel.findById(itemId).exec();
      if (!lesson) {
        throw new NotFoundException(`Lesson with ID "${itemId}" not found`);
      }
    } else if (type === 'puzzle') {
      const puzzle = await this.puzzleModel.findById(itemId).exec();
      if (!puzzle) {
        throw new NotFoundException(`Puzzle with ID "${itemId}" not found`);
      }
    } else {
      throw new BadRequestException(`Invalid item type: ${type}`);
    }
  }

  private async validateItems(items: Array<{ type: string; itemId: string }>): Promise<void> {
    for (const item of items) {
      if (item.type !== 'lesson' && item.type !== 'puzzle') {
        throw new BadRequestException(
          `Invalid item type: ${item.type}. Must be 'lesson' or 'puzzle'`,
        );
      }
      await this.validateItem(item.type as 'lesson' | 'puzzle', item.itemId);
    }
  }
}
