import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PuzzlesController } from './puzzles.controller';
import { PuzzlesService } from './puzzles.service';
import { PuzzleSolveService } from './puzzle-solve.service';
import { Puzzle, PuzzleSchema } from './schemas/puzzle.schema';
import { UserPuzzleSolve, UserPuzzleSolveSchema } from './schemas/user-puzzle-solve.schema';
import { UserPuzzleStats, UserPuzzleStatsSchema } from './schemas/user-puzzle-stats.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Puzzle.name, schema: PuzzleSchema },
      { name: UserPuzzleSolve.name, schema: UserPuzzleSolveSchema },
      { name: UserPuzzleStats.name, schema: UserPuzzleStatsSchema },
    ]),
    AuthModule,  // Import AuthModule for JWT authentication
  ],
  controllers: [PuzzlesController],
  providers: [PuzzlesService, PuzzleSolveService],
  exports: [PuzzlesService, PuzzleSolveService],
})
export class PuzzlesModule {}

