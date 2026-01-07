import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Move {
  @Prop({ required: true, enum: ['square', 'move', 'highlight'] })
  type: string;

  @Prop({ default: '' })
  square: string; // Required if type is 'square' or 'highlight', blank if type is 'move'

  @Prop({ default: '' })
  player_action: string; // Required if type is 'move', blank if type is 'square' or 'highlight'

  @Prop({ default: '' })
  opp_action?: string; // Optional opponent response (not used for highlight type)

  @Prop({ type: [String], default: [] })
  prompts: string[];
}

export const MoveSchema = SchemaFactory.createForClass(Move);

