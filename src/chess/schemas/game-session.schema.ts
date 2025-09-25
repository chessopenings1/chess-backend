import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameSessionDocument = GameSession & Document;

@Schema({ timestamps: true })
export class GameSession {
  @Prop({ required: true, unique: true })
  gameId: string;

  @Prop({ required: true })
  fen: string;

  @Prop({ type: [String], default: [] })
  moves: string[];

  @Prop({ default: false })
  isGameOver: boolean;

  @Prop()
  result?: string;

  @Prop({ required: true, enum: ['w', 'b'] })
  turn: string;

  @Prop()
  openingId?: string;

  @Prop({ default: 0 })
  currentMoveIndex: number;

  @Prop()
  lastMoveFrom?: string;

  @Prop()
  lastMoveTo?: string;
}

export const GameSessionSchema = SchemaFactory.createForClass(GameSession);
