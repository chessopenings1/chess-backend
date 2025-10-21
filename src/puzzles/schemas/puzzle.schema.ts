import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PuzzleDocument = Puzzle & Document;

@Schema({ timestamps: true })
export class Puzzle {
  @Prop({ required: true, unique: true })
  PuzzleId: string;

  @Prop({ required: true })
  FEN: string;

  @Prop({ type: [String], required: true })
  Moves: string[];

  @Prop({ required: true })
  Rating: number;

  @Prop({ required: true })
  RatingDeviation: number;

  @Prop({ required: true })
  Popularity: number;

  @Prop({ required: true })
  NbPlays: number;

  @Prop({ type: [String], required: true })
  Themes: string[];

  @Prop({ required: true })
  GameUrl: string;

  @Prop({ default: '' })
  OpeningTags: string;

  @Prop({ default: false })
  isOpening: boolean;
}

export const PuzzleSchema = SchemaFactory.createForClass(Puzzle);

