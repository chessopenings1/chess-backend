export interface ChessMove {
  move: string;
  player: 'white' | 'black';
  description?: string;
}

export interface ChessOpening {
  id: string;
  name: string;
  description: string;
  moves: ChessMove[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const OPENINGS: ChessOpening[] = [
  {
    id: 'italian-game',
    name: 'Italian Game',
    description: 'A classical opening that focuses on rapid development and control of the center.',
    category: 'Open Games',
    difficulty: 'beginner',
    moves: [
      { move: 'e2e4', player: 'white', description: 'King\'s Pawn Opening' },
      { move: 'e7e5', player: 'black', description: 'King\'s Pawn Defense' },
      { move: 'g1f3', player: 'white', description: 'Knight to f3' },
      { move: 'b8c6', player: 'black', description: 'Knight to c6' },
      { move: 'f1c4', player: 'white', description: 'Bishop to c4 - Italian Game' },
      { move: 'f8c5', player: 'black', description: 'Bishop to c5 - Classical Defense' },
    ],
  },
  {
    id: 'sicilian-defense',
    name: 'Sicilian Defense',
    description: 'The most popular response to 1.e4, known for its asymmetrical positions.',
    category: 'Semi-Open Games',
    difficulty: 'intermediate',
    moves: [
      { move: 'e2e4', player: 'white', description: 'King\'s Pawn Opening' },
      { move: 'c7c5', player: 'black', description: 'Sicilian Defense' },
      { move: 'g1f3', player: 'white', description: 'Knight to f3' },
      { move: 'd7d6', player: 'black', description: 'Pawn to d6' },
      { move: 'd2d4', player: 'white', description: 'Pawn to d4' },
      { move: 'c5d4', player: 'black', description: 'Pawn takes d4' },
      { move: 'f3d4', player: 'white', description: 'Knight takes d4' },
    ],
  },
  {
    id: 'queens-gambit',
    name: 'Queen\'s Gambit',
    description: 'A strategic opening that offers a pawn to gain central control.',
    category: 'Closed Games',
    difficulty: 'intermediate',
    moves: [
      { move: 'd2d4', player: 'white', description: 'Queen\'s Pawn Opening' },
      { move: 'd7d5', player: 'black', description: 'Queen\'s Pawn Defense' },
      { move: 'c2c4', player: 'white', description: 'Queen\'s Gambit' },
      { move: 'e7e6', player: 'black', description: 'Queen\'s Gambit Declined' },
      { move: 'b1c3', player: 'white', description: 'Knight to c3' },
      { move: 'g8f6', player: 'black', description: 'Knight to f6' },
    ],
  },
  {
    id: 'kings-gambit',
    name: 'King\'s Gambit',
    description: 'An aggressive opening that sacrifices a pawn for rapid development.',
    category: 'Open Games',
    difficulty: 'advanced',
    moves: [
      { move: 'e2e4', player: 'white', description: 'King\'s Pawn Opening' },
      { move: 'e7e5', player: 'black', description: 'King\'s Pawn Defense' },
      { move: 'f2f4', player: 'white', description: 'King\'s Gambit' },
      { move: 'e5f4', player: 'black', description: 'Accepts the gambit' },
      { move: 'g1f3', player: 'white', description: 'Knight to f3' },
      { move: 'g7g5', player: 'black', description: 'Pawn to g5' },
    ],
  },
  {
    id: 'ruy-lopez',
    name: 'Ruy Lopez',
    description: 'A classical opening that develops the bishop to attack the knight defending the e5 pawn.',
    category: 'Open Games',
    difficulty: 'intermediate',
    moves: [
      { move: 'e2e4', player: 'white', description: 'King\'s Pawn Opening' },
      { move: 'e7e5', player: 'black', description: 'King\'s Pawn Defense' },
      { move: 'g1f3', player: 'white', description: 'Knight to f3' },
      { move: 'b8c6', player: 'black', description: 'Knight to c6' },
      { move: 'f1b5', player: 'white', description: 'Ruy Lopez - Spanish Opening' },
      { move: 'a7a6', player: 'black', description: 'Morphy Defense' },
      { move: 'b5a4', player: 'white', description: 'Bishop retreats' },
    ],
  },
];

export function getOpeningById(id: string): ChessOpening | undefined {
  return OPENINGS.find(opening => opening.id === id);
}

export function getAllOpenings(): ChessOpening[] {
  return OPENINGS;
}

export function getOpeningsByCategory(category: string): ChessOpening[] {
  return OPENINGS.filter(opening => opening.category === category);
}

export function getOpeningsByDifficulty(difficulty: string): ChessOpening[] {
  return OPENINGS.filter(opening => opening.difficulty === difficulty);
}
