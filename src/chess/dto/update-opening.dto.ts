import { PartialType } from '@nestjs/mapped-types';
import { CreateChessOpeningDto } from './create-opening.dto';

export class UpdateChessOpeningDto extends PartialType(CreateChessOpeningDto) {}
