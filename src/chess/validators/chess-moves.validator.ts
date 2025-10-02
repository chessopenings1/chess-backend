import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { Chess } from 'chess.js';

export function IsValidChessMoves(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidChessMoves',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!Array.isArray(value)) {
            return false;
          }

          if (value.length === 0) {
            return false;
          }

          try {
            const chess = new Chess();
            
            for (let i = 0; i < value.length; i++) {
              const move = value[i];
              
              if (typeof move !== 'string' || move.trim() === '') {
                return false;
              }
              
              // Try to make the move
              const result = chess.move(move.trim());
              if (!result) {
                return false;
              }
            }
            
            return true;
          } catch (error) {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          const value = args.value;
          if (!Array.isArray(value)) {
            return 'Moves must be an array of strings';
          }
          
          if (value.length === 0) {
            return 'At least one move is required';
          }
          
          try {
            const chess = new Chess();
            for (let i = 0; i < value.length; i++) {
              const move = value[i];
              if (typeof move !== 'string' || move.trim() === '') {
                return `Move at position ${i + 1} must be a non-empty string`;
              }
              
              const result = chess.move(move.trim());
              if (!result) {
                return `Invalid chess move "${move}" at position ${i + 1}. Use standard algebraic notation (e.g., "e4", "Nf3", "O-O")`;
              }
            }
          } catch (error) {
            return 'Invalid chess moves provided. Use standard algebraic notation';
          }
          
          return 'Each move must be a valid chess move in standard algebraic notation';
        },
      },
    });
  };
}
