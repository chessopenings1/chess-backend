import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChessOpeningDocument = ChessOpening & Document;

@Schema({ timestamps: true })
export class ChessOpening {
  @Prop({ required: true })
  Opening: string;

  @Prop({ required: true, enum: ['white', 'black'] })
  Colour: string;

  @Prop({ required: true })
  'Num Games': number;

  @Prop({ required: true })
  'Perf Rating': number;

  @Prop({ required: true })
  'Avg Player': number;

  @Prop({ required: true })
  'Player Win %': number;

  @Prop({ required: true })
  'Draw %': number;

  @Prop({ required: true })
  'Opponent Win %': number;

  @Prop({ required: true })
  Moves: string;

  @Prop({ type: [String], required: true })
  moves_list: string[];

  @Prop({ required: true})
  moves_length: number;

  @Prop({ required: true })
  'White_win%': number;

  @Prop({ required: true })
  'Black_win%': number;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const ChessOpeningSchema = SchemaFactory.createForClass(ChessOpening);
