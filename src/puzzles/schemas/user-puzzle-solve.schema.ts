import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserPuzzleSolveDocument = UserPuzzleSolve & Document;

@Schema({ timestamps: true })
export class UserPuzzleSolve {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Puzzle' })
  puzzleId: Types.ObjectId;

  @Prop({ required: true })
  puzzleRating: number; // Rating of the puzzle at time of solve

  @Prop({ required: true })
  userRatingBefore: number; // User's rating before this solve

  @Prop({ required: true })
  userRatingAfter: number; // User's rating after this solve

  @Prop({ required: true })
  success: boolean; // Whether the user solved it correctly

  @Prop({ required: true })
  timeSpent: number; // Time spent in seconds

  @Prop()
  attemptsMade?: number; // Number of attempts before solving
}

export const UserPuzzleSolveSchema = SchemaFactory.createForClass(UserPuzzleSolve);

// Create compound index to track unique user-puzzle combinations
UserPuzzleSolveSchema.index({ userId: 1, puzzleId: 1 });

