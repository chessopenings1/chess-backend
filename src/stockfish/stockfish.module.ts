import { Module } from '@nestjs/common';
import { StockfishController } from './stockfish.controller';
import { StockfishService } from './stockfish.service';

@Module({
  controllers: [StockfishController],
  providers: [StockfishService],
  exports: [StockfishService],
})
export class StockfishModule {}
