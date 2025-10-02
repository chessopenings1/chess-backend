import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ChessOpeningService } from './chess-opening.service';
import { CreateChessOpeningDto } from './dto/create-opening.dto';
import { UpdateChessOpeningDto } from './dto/update-opening.dto';

@Controller('chess-openings')
export class ChessOpeningController {
  constructor(private readonly chessOpeningService: ChessOpeningService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createChessOpeningDto: CreateChessOpeningDto) {
    const opening = await this.chessOpeningService.create(createChessOpeningDto);
    return {
      success: true,
      data: opening,
      message: 'Chess opening created successfully'
    };
  }

  @Get()
  async findAll() {
    const openings = await this.chessOpeningService.findAll();
    return {
      success: true,
      data: openings,
      count: openings.length
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const opening = await this.chessOpeningService.findOne(id);
    return {
      success: true,
      data: opening
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateChessOpeningDto: UpdateChessOpeningDto) {
    const opening = await this.chessOpeningService.update(id, updateChessOpeningDto);
    return {
      success: true,
      data: opening,
      message: 'Chess opening updated successfully'
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.chessOpeningService.remove(id);
    return {
      success: true,
      message: 'Chess opening deleted successfully'
    };
  }
}
