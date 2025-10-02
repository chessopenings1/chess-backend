import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChessOpeningDocument = ChessOpening & Document;

@Schema({ timestamps: true })
export class ChessOpening {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 1, max: 10 })
  difficulty: number;

  @Prop({ required: true, enum: ['white', 'black'] })
  player: string;

  @Prop({ type: [String], required: true })
  moves: string[]; // Array of moves in standard chess notation (e.g., ['e4', 'e5', 'Nf3', 'Nc6'])
}

export const ChessOpeningSchema = SchemaFactory.createForClass(ChessOpening);
