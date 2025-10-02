import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChessOpeningController } from './chess-opening.controller';
import { ChessOpeningService } from './chess-opening.service';
import { ChessOpening, ChessOpeningSchema } from './schemas/chess-opening.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChessOpening.name, schema: ChessOpeningSchema },
    ]),
  ],
  controllers: [ChessOpeningController],
  providers: [ChessOpeningService],
  exports: [ChessOpeningService],
})
export class ChessOpeningModule {}
