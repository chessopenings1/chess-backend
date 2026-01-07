import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateIf,
  Matches,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

// Custom validator to ensure square is blank when type is 'move'
function IsBlankIfMove(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isBlankIfMove',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as MoveDto;
          // Only validate if type is 'move', otherwise skip
          if (obj.type !== 'move') {
            return true;
          }
          return !value || (typeof value === 'string' && value.trim() === '');
        },
        defaultMessage(args: ValidationArguments) {
          return 'square must be blank when type is "move"';
        },
      },
    });
  };
}

// Custom validator to ensure player_action is blank when type is 'square' or 'highlight'
function IsBlankIfSquare(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isBlankIfSquare',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as MoveDto;
          // Only validate if type is 'square' or 'highlight', otherwise skip
          if (obj.type !== 'square' && obj.type !== 'highlight') {
            return true;
          }
          return !value || (typeof value === 'string' && value.trim() === '');
        },
        defaultMessage(args: ValidationArguments) {
          return 'player_action must be blank when type is "square" or "highlight"';
        },
      },
    });
  };
}

// Custom validator to ensure opp_action is blank when type is 'highlight'
function IsBlankIfHighlight(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isBlankIfHighlight',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as MoveDto;
          // Only validate if type is 'highlight', otherwise skip
          if (obj.type !== 'highlight') {
            return true;
          }
          return !value || (typeof value === 'string' && value.trim() === '');
        },
        defaultMessage(args: ValidationArguments) {
          return 'opp_action must be blank when type is "highlight"';
        },
      },
    });
  };
}

export class MoveDto {
  @IsEnum(['square', 'move', 'highlight'])
  @IsNotEmpty()
  type: string;

  // For type 'square' or 'highlight': square is required and must be valid chess square
  // For type 'move': square must be blank
  @ValidateIf((o) => o.type === 'square' || o.type === 'highlight')
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-h][1-8]$/, {
    message: 'square must be a valid chess square (e.g., e4, a1, h8)',
  })
  @IsBlankIfMove({ message: 'square must be blank when type is "move"' })
  square?: string;

  // For type 'move': player_action is required and must be valid chess move
  // For type 'square' or 'highlight': player_action must be blank
  @ValidateIf((o) => o.type === 'move')
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-h][1-8][a-h][1-8]$/, {
    message:
      'player_action must be a valid chess move in from-to format (e.g., e2e4, g1f3)',
  })
  @IsBlankIfSquare({ message: 'player_action must be blank when type is "square" or "highlight"' })
  player_action?: string;

  @IsString()
  @IsOptional()
  @IsBlankIfHighlight({ message: 'opp_action must be blank when type is "highlight"' })
  opp_action?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prompts?: string[];
}
