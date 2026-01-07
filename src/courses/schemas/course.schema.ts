import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CourseItem, CourseItemSchema } from './course-item.schema';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  difficulty: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [CourseItemSchema], default: [] })
  items: CourseItem[];

  @Prop({ type: [String], default: [] })
  prompts: string[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);

