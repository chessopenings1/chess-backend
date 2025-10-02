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
    // Trim whitespace from name
    const trimmedName = createChessOpeningDto.name.trim();
    
    try {
      const openingData = {
        ...createChessOpeningDto,
        name: trimmedName
      };
      const createdOpening = new this.chessOpeningModel(openingData);
      return await createdOpening.save();
    } catch (error) {
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
}
