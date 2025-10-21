import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserPuzzleStatsDocument = UserPuzzleStats & Document;

@Schema({ timestamps: true })
export class UserPuzzleStats {
  @Prop({ type: Types.ObjectId, required: true, unique: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ default: 0 })
  totalPuzzlesSolved: number;

  @Prop({ default: 0 })
  totalPuzzlesAttempted: number;

  @Prop({ default: 1500 }) // Standard starting Glicko-2 rating
  puzzleRating: number;

  @Prop({ default: 350 }) // Standard starting RD (Rating Deviation)
  ratingDeviation: number;

  @Prop({ default: 0.06 }) // Volatility - measures rating consistency
  volatility: number;

  @Prop({ default: 0 })
  correctSolves: number;

  @Prop({ default: 0 })
  incorrectSolves: number;

  @Prop()
  lastSolvedAt?: Date;

  @Prop({ default: 0 })
  averageTimePerPuzzle?: number; // Average time in seconds

  @Prop({ default: 0 })
  currentStreak: number; // Current solving streak

  @Prop({ default: 0 })
  longestStreak: number; // Best solving streak
}

export const UserPuzzleStatsSchema = SchemaFactory.createForClass(UserPuzzleStats);

