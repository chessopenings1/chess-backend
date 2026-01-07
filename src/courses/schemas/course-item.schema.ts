import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class CourseItem {
  @Prop({ required: true, enum: ['lesson', 'puzzle'] })
  type: string;

  @Prop({ required: true, type: Types.ObjectId })
  itemId: Types.ObjectId;

  @Prop({ required: true })
  order: number;
}

export const CourseItemSchema = SchemaFactory.createForClass(CourseItem);

