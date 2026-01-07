import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Move, MoveSchema } from './move.schema';

export type LessonDocument = Lesson & Document;

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ required: true })
  starting_fen: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [MoveSchema], default: [] })
  moves: Move[];

  @Prop({ required: true, enum: ['black', 'white'] })
  turn: string;

  @Prop({ type: [String], default: [] })
  prompts: string[];
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

