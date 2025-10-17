import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChessOpening, ChessOpeningDocument } from './schemas/chess-opening.schema';
import { CreateChessOpeningDto } from './dto/create-opening.dto';
import { UpdateChessOpeningDto } from './dto/update-opening.dto';

@Injectable()
export class ChessOpeningService {
  constructor(
    @InjectModel(ChessOpening.name) private chessOpeningModel: Model<ChessOpeningDocument>,
  ) {}

  async create(createChessOpeningDto: CreateChessOpeningDto): Promise<ChessOpening> {
    // Check if opening with this slug already exists
    const existingOpening = await this.chessOpeningModel.findOne({
      slug: createChessOpeningDto.slug
    }).exec();
    
    if (existingOpening) {
      throw new ConflictException(`Chess opening with slug "${createChessOpeningDto.slug}" already exists`);
    }
    
    try {
      const createdOpening = new this.chessOpeningModel(createChessOpeningDto);
      return await createdOpening.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Chess opening with this slug already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<ChessOpening[]> {
    return await this.chessOpeningModel.find().exec();
  }

  async findOne(id: string): Promise<ChessOpening> {
    const opening = await this.chessOpeningModel.findById(id).exec();
    if (!opening) {
      throw new NotFoundException(`Chess opening with ID ${id} not found`);
    }
    return opening;
  }

  async update(id: string, updateChessOpeningDto: UpdateChessOpeningDto): Promise<ChessOpening> {
    try {
      const updatedOpening = await this.chessOpeningModel
        .findByIdAndUpdate(id, updateChessOpeningDto, { new: true })
        .exec();
      
      if (!updatedOpening) {
        throw new NotFoundException(`Chess opening with ID ${id} not found`);
      }
      
      return updatedOpening;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.chessOpeningModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Chess opening with ID ${id} not found`);
    }
  }

  async findByColour(colour: 'white' | 'black'): Promise<ChessOpening[]> {
    return await this.chessOpeningModel.find({ Colour: colour }).exec();
  }

  async findBySlug(slug: string): Promise<ChessOpening> {
    const opening = await this.chessOpeningModel.findOne({ slug }).exec();
    if (!opening) {
      throw new NotFoundException(`Chess opening with slug "${slug}" not found`);
    }
    return opening;
  }

  async searchByName(searchTerm: string): Promise<ChessOpening[]> {
    return await this.chessOpeningModel.find({
      Opening: { $regex: searchTerm, $options: 'i' }
    }).exec();
  }

  async findByTags(tags: string[]): Promise<ChessOpening[]> {
    return await this.chessOpeningModel.find({
      tags: { $in: tags }
    }).exec();
  }

  async foo(): Promise<string> {
    const openings =  await this.chessOpeningModel.find().exec();
    openings.forEach(async opening => {
      opening.moves_length = opening.moves_list.length;
      opening['Num Games'] = +opening['Num Games'];
      opening["Perf Rating"] = +opening["Perf Rating"];
      opening["Avg Player"] = +opening["Avg Player"];
      opening["Player Win %"] = +opening["Player Win %"];
      opening["Draw %"] = +opening["Draw %"];
      opening["Opponent Win %"] = +opening["Opponent Win %"];
      opening["White_win%"] = +opening["White_win%"];
      opening["Black_win%"] = +opening["Black_win%"];
      await this.chessOpeningModel.findByIdAndUpdate(opening._id, opening).exec();
    });
    return "foo";
  }
}
