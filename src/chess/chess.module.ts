import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChessController } from './chess.controller';
import { ChessService } from './chess.service';
import { ChessMongoService } from './chess-mongo.service';
import { SeedService } from './seed.service';
import { ChessOpening, ChessOpeningSchema } from './schemas/chess-opening.schema';
import { GameSession, GameSessionSchema } from './schemas/game-session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChessOpening.name, schema: ChessOpeningSchema },
      { name: GameSession.name, schema: GameSessionSchema },
    ]),
  ],
  controllers: [ChessController],
  providers: [ChessService, ChessMongoService, SeedService],
  exports: [ChessService, ChessMongoService, SeedService],
})
export class ChessModule {}
