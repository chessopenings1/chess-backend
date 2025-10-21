import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ChessOpeningService } from './chess-opening.service';
import { CreateChessOpeningDto } from './dto/create-opening.dto';
import { UpdateChessOpeningDto } from './dto/update-opening.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  name: string;
}

@Controller('chess-openings')
@UseGuards(JwtAuthGuard)  // Apply JWT authentication to all routes in this controller
export class ChessOpeningController {
  constructor(private readonly chessOpeningService: ChessOpeningService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createChessOpeningDto: CreateChessOpeningDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const opening = await this.chessOpeningService.create(createChessOpeningDto);
    return {
      success: true,
      data: opening,
      message: 'Chess opening created successfully',
      user: { id: user.userId, email: user.email, name: user.name }
    };
  }

  @Get()
  async findAll(@GetUser() user: AuthenticatedUser) {
    const openings = await this.chessOpeningService.findAll();
    return {
      success: true,
      data: openings,
      count: openings.length,
      user: { id: user.userId, email: user.email }
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
  async findOne(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const opening = await this.chessOpeningService.findOne(id);
    return {
      success: true,
      data: opening,
      user: { id: user.userId }
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateChessOpeningDto: UpdateChessOpeningDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const opening = await this.chessOpeningService.update(id, updateChessOpeningDto);
    return {
      success: true,
      data: opening,
      message: 'Chess opening updated successfully',
      user: { id: user.userId }
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    await this.chessOpeningService.remove(id);
    return {
      success: true,
      message: 'Chess opening deleted successfully',
      user: { id: user.userId }
    };
  }

  @Get('colour/:colour')
  async findByColour(
    @Param('colour') colour: 'white' | 'black',
    @GetUser() user: AuthenticatedUser,
  ) {
    const openings = await this.chessOpeningService.findByColour(colour);
    return {
      success: true,
      data: openings,
      count: openings.length,
      user: { id: user.userId }
    };
  }

  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const opening = await this.chessOpeningService.findBySlug(slug);
    return {
      success: true,
      data: opening,
      user: { id: user.userId }
    };
  }

  @Get('search')
  async searchByName(
    @Query('q') searchTerm: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const openings = await this.chessOpeningService.searchByName(searchTerm);
    return {
      success: true,
      data: openings,
      count: openings.length,
      user: { id: user.userId }
    };
  }

  @Get('tags')
  async findByTags(
    @Query('tags') tags: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    const openings = await this.chessOpeningService.findByTags(tagArray);
    return {
      success: true,
      data: openings,
      count: openings.length,
      user: { id: user.userId }
    };
  }
}
