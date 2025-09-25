# Chess Openings Tutorial Backend

A NestJS backend API for a chess openings tutorial application.

## Features

- Chess game management with multiple concurrent games
- Chess opening data and tutorials stored in MongoDB
- Move validation and game state tracking
- RESTful API endpoints
- CORS enabled for frontend integration
- MongoDB Atlas integration for persistent data storage

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- The MongoDB connection string is already configured in the code

## Installation

```bash
npm install
```

## Database Setup

The application is configured to connect to MongoDB Atlas using environment variables. The `.env` file contains the MongoDB connection string.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=mongodb+srv://chessopenings1_db_user:1Q1f3QFtbtu5vEth@chess-dev.hr41aeu.mongodb.net/?retryWrites=true&w=majority&appName=Chess-dev
PORT=3001
NODE_ENV=development
```

To seed the database with chess opening data:

```bash
npm run seed
```

## Running the Application

```bash
# Development
npm run start

# Watch mode
npm run start:dev

# Production
npm run start:prod
```

The application will be available at `http://localhost:3001`

## API Endpoints

### General
- `GET /` - Welcome message
- `GET /api` - API information

### Chess Openings
- `GET /chess/openings` - Get all chess openings
- `GET /chess/openings/:id` - Get specific opening by ID
- `GET /chess/openings/category/:category` - Get openings by category
- `GET /chess/openings/difficulty/:difficulty` - Get openings by difficulty

### Game Management
- `POST /chess/game` - Create a new game
- `GET /chess/game/:gameId` - Get game state
- `PUT /chess/game/:gameId/move` - Make a move
- `PUT /chess/game/:gameId/reset` - Reset game
- `POST /chess/game/:gameId/opening/:openingId` - Load opening into game
- `DELETE /chess/game/:gameId` - Delete game
- `GET /chess/game/:gameId/history` - Get game history
- `GET /chess/game/:gameId/moves` - Get possible moves

### Database Management
- `POST /chess/seed` - Seed the database with chess opening data

## Example Usage

### Create a new game
```bash
curl -X POST http://localhost:3001/chess/game \
  -H "Content-Type: application/json" \
  -d '{"gameId": "game1"}'
```

### Make a move
```bash
curl -X PUT http://localhost:3001/chess/game/game1/move \
  -H "Content-Type: application/json" \
  -d '{"move": "e2e4"}'
```

### Load an opening
```bash
curl -X POST http://localhost:3001/chess/game/game1/opening/italian-game
```

### Get all openings
```bash
curl http://localhost:3001/chess/openings
```

### Seed the database
```bash
curl -X POST http://localhost:3001/chess/seed
```

## Available Openings

- Italian Game (beginner)
- Sicilian Defense (intermediate)
- Queen's Gambit (intermediate)
- King's Gambit (advanced)
- Ruy Lopez (intermediate)

## Technologies Used

- NestJS
- TypeScript
- MongoDB with Mongoose
- chess.js library
- CORS for cross-origin requests

## Development

The project uses:
- ESLint for code linting
- Prettier for code formatting
- Jest for testing

Run tests:
```bash
npm run test
```

Run e2e tests:
```bash
npm run test:e2e
```