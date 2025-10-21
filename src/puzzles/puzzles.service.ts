import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Puzzle, PuzzleDocument } from './schemas/puzzle.schema';
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import fs from "fs";
import streamJsonPkg from "stream-json";
import streamArrayPkg from "stream-json/streamers/StreamArray.js";

const { parser } = streamJsonPkg;
const { streamArray } = streamArrayPkg;


@Injectable()
export class PuzzlesService {
  constructor(
    @InjectModel(Puzzle.name) private puzzleModel: Model<PuzzleDocument>,
  ) {}

  async create(createPuzzleDto: CreatePuzzleDto): Promise<Puzzle> {
    // Check if puzzle with this PuzzleId already exists
    const existingPuzzle = await this.puzzleModel.findOne({
      PuzzleId: createPuzzleDto.PuzzleId
    }).exec();
    
    if (existingPuzzle) {
      throw new ConflictException(`Puzzle with ID "${createPuzzleDto.PuzzleId}" already exists`);
    }
    
    try {
      const createdPuzzle = new this.puzzleModel(createPuzzleDto);
      return await createdPuzzle.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Puzzle with this ID already exists');
      }
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 1000): Promise<{ puzzles: Puzzle[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const [puzzles, total] = await Promise.all([
      this.puzzleModel.find().skip(skip).limit(limit).exec(),
      this.puzzleModel.countDocuments().exec()
    ]);

    return {
      puzzles,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string): Promise<Puzzle> {
    const puzzle = await this.puzzleModel.findById(id).exec();
    if (!puzzle) {
      throw new NotFoundException(`Puzzle with ID ${id} not found`);
    }
    return puzzle;
  }

  async findByPuzzleId(puzzleId: string): Promise<Puzzle> {
    const puzzle = await this.puzzleModel.findOne({ PuzzleId: puzzleId }).exec();
    if (!puzzle) {
      throw new NotFoundException(`Puzzle with PuzzleId "${puzzleId}" not found`);
    }
    return puzzle;
  }

  async update(id: string, updatePuzzleDto: UpdatePuzzleDto): Promise<Puzzle> {
    try {
      const updatedPuzzle = await this.puzzleModel
        .findByIdAndUpdate(id, updatePuzzleDto, { new: true })
        .exec();
      
      if (!updatedPuzzle) {
        throw new NotFoundException(`Puzzle with ID ${id} not found`);
      }
      
      return updatedPuzzle;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Puzzle with this ID already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.puzzleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Puzzle with ID ${id} not found`);
    }
  }

  // Additional query methods
  async findByRatingRange(minRating: number, maxRating: number): Promise<Puzzle[]> {
    return await this.puzzleModel.find({
      Rating: { 
        $gte: minRating.toString(), 
        $lte: maxRating.toString() 
      }
    }).exec();
  }

  async findByTheme(theme: string): Promise<Puzzle[]> {
    return await this.puzzleModel.find({
      Themes: { $regex: theme, $options: 'i' }
    }).exec();
  }

  async findOpeningPuzzles(): Promise<Puzzle[]> {
    return await this.puzzleModel.find({ isOpening: true }).exec();
  }

  async foo(): Promise<string> {
    const inputFile = "./lichess_db_puzzle-1.json";
    
    const readStream = fs.createReadStream(inputFile);
    
    const pipeline = readStream.pipe(parser()).pipe(streamArray());

    let count = 0;

    for await (const { value } of pipeline) {
      count++
      if (count < 10000) {
        value.Moves = value.Moves.split(" ");
        value.Rating = parseInt(value.Rating);
        value.RatingDeviation = parseInt(value.RatingDeviation);
        value.Popularity = parseInt(value.Popularity);
        value.NbPlays = parseInt(value.NbPlays);
        const createdPuzzle = new this.puzzleModel(value);
        await createdPuzzle.save();
      } else {
        break;
      }
    }
    
    return "foo";
  }
}

