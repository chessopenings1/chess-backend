import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
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

  @Get('foo')
  async foo() {
    const bar = await this.chessOpeningService.foo();
    return {
      success: true,
      data: bar
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

  @Get('colour/:colour')
  async findByColour(@Param('colour') colour: 'white' | 'black') {
    const openings = await this.chessOpeningService.findByColour(colour);
    return {
      success: true,
      data: openings,
      count: openings.length
    };
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const opening = await this.chessOpeningService.findBySlug(slug);
    return {
      success: true,
      data: opening
    };
  }

  @Get('search')
  async searchByName(@Query('q') searchTerm: string) {
    const openings = await this.chessOpeningService.searchByName(searchTerm);
    return {
      success: true,
      data: openings,
      count: openings.length
    };
  }

  @Get('tags')
  async findByTags(@Query('tags') tags: string) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    const openings = await this.chessOpeningService.findByTags(tagArray);
    return {
      success: true,
      data: openings,
      count: openings.length
    };
  }
}
