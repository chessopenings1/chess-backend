import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChessOpeningDocument = ChessOpening & Document;

@Schema({ timestamps: true })
export class ChessMove {
  @Prop({ required: true })
  move: string;

  @Prop({ required: true, enum: ['white', 'black'] })
  player: string;

  @Prop()
  description?: string;
}

@Schema({ timestamps: true })
export class ChessOpening {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [ChessMove], required: true })
  moves: ChessMove[];

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, enum: ['beginner', 'intermediate', 'advanced'] })
  difficulty: string;
}

export const ChessMoveSchema = SchemaFactory.createForClass(ChessMove);
export const ChessOpeningSchema = SchemaFactory.createForClass(ChessOpening);
