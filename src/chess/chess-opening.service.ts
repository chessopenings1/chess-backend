import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChessOpening, ChessOpeningDocument } from './schemas/chess-opening.schema';
import { CreateChessOpeningDto } from './dto/create-opening.dto';
import { UpdateChessOpeningDto } from './dto/update-opening.dto';
import fs from "fs";
import streamJsonPkg from "stream-json";
import streamArrayPkg from "stream-json/streamers/StreamArray.js";
import slugify from 'slugify';

const { parser } = streamJsonPkg;
const { streamArray } = streamArrayPkg;

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
    const inputFile = "./lichess_db_puzzle-1.json";
    
    const readStream = fs.createReadStream(inputFile);
    
    const pipeline = readStream.pipe(parser()).pipe(streamArray());

    let first = true;
    let count = 0;

    for await (const { value } of pipeline) {
      count++
      while (count < 10000) {
        
      }
      // console.log(value);
    }
    
    return "foo";
  }
}
