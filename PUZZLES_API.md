# Puzzles API Documentation

## Base URL
```
http://localhost:3001/puzzles
```

## Authentication

All puzzle endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

## Data Structure

Each puzzle contains the following fields:

```typescript
{
  _id: string;                // MongoDB ObjectId (auto-generated)
  PuzzleId: string;           // Unique puzzle identifier (e.g., "00008")
  FEN: string;                // Board position in FEN notation
  Moves: string;              // Solution moves (space-separated)
  Rating: string;             // Puzzle difficulty rating
  RatingDeviation: string;    // Rating uncertainty
  Popularity: string;         // Popularity score
  NbPlays: string;            // Number of times played
  Themes: string[];           // Array of puzzle themes/tags
  GameUrl: string;            // Link to original game on Lichess
  OpeningTags: string;        // Opening classification (optional)
  isOpening: boolean;         // Whether puzzle is opening-related
  createdAt: Date;            // Auto-generated timestamp
  updatedAt: Date;            // Auto-generated timestamp
}
```

## API Endpoints

### 1. Create Puzzle
**POST** `/puzzles`

Creates a new puzzle.

**Request Body:**
```json
{
  "PuzzleId": "00008",
  "FEN": "r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2R1/PqP2bPP/7K b - - 0 24",
  "Moves": "f2g3 e6e7 b2b1 b3c1 b1c1 h6c1",
  "Rating": "1807",
  "RatingDeviation": "75",
  "Popularity": "95",
  "NbPlays": "8585",
  "Themes": ["crushing", "hangingPiece", "long", "middlegame"],
  "GameUrl": "https://lichess.org/787zsVup/black#48",
  "OpeningTags": "",
  "isOpening": false
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": { /* created puzzle with _id */ },
  "message": "Puzzle created successfully",
  "user": { "id": "64f5a1b2c3d4e5f6a7b8c9d0" }
}
```

---

### 2. Get All Puzzles
**GET** `/puzzles`

Retrieves all puzzles.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ /* array of puzzles */ ],
  "count": 500,
  "user": { "id": "64f5a1b2c3d4e5f6a7b8c9d0" }
}
```

---

### 3. Get Puzzle by ID
**GET** `/puzzles/:id`

Retrieves a specific puzzle by MongoDB ObjectId.

**Parameters:**
- `id` - MongoDB ObjectId

**Example:**
```bash
GET /puzzles/507f1f77bcf86cd799439011
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* puzzle object */ },
  "user": { "id": "64f5a1b2c3d4e5f6a7b8c9d0" }
}
```

---

### 4. Get Puzzle by PuzzleId
**GET** `/puzzles/puzzle-id/:puzzleId`

Retrieves a specific puzzle by its PuzzleId (e.g., "00008").

**Parameters:**
- `puzzleId` - Unique puzzle identifier

**Example:**
```bash
GET /puzzles/puzzle-id/00008
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* puzzle object */ },
  "user": { "id": "64f5a1b2c3d4e5f6a7b8c9d0" }
}
```

---

### 5. Get Opening Puzzles
**GET** `/puzzles/opening`

Retrieves all puzzles related to chess openings (where `isOpening: true`).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ /* array of opening puzzles */ ],
  "count": 45,
  "user": { "id": "64f5a1b2c3d4e5f6a7b8c9d0" }
}
```

---

### 6. Get Puzzles by Rating Range
**GET** `/puzzles/rating?min={minRating}&max={maxRating}`

Retrieves puzzles within a specific rating range.

**Query Parameters:**
- `min` - Minimum rating (default: 0)
- `max` - Maximum rating (default: 3000)

**Example:**
```bash
GET /puzzles/rating?min=1500&max=2000
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ /* array of puzzles in rating range */ ],
  "count": 150,
  "user": { "id": "64f5a1b2c3d4e5f6a7b8c9d0" }
}
```

---

### 7. Get Puzzles by Theme
**GET** `/puzzles/theme/:theme`

Retrieves puzzles containing a specific theme (case-insensitive search).

**Parameters:**
- `theme` - Theme keyword to search for

**Example:**
```bash
GET /puzzles/theme/endgame
GET /puzzles/theme/fork
GET /puzzles/theme/pin
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ /* array of puzzles with matching theme */ ],
  "count": 75,
  "user": { "id": "64f5a1b2c3d4e5f6a7b8c9d0" }
}
```

---

### 8. Update Puzzle
**PATCH** `/puzzles/:id`

Updates a specific puzzle (partial update).

**Parameters:**
- `id` - MongoDB ObjectId

**Request Body:** (all fields optional)
```json
{
  "Rating": "1850",
  "Popularity": "98",
  "Themes": ["crushing", "hangingPiece", "long", "middlegame", "advanced"]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* updated puzzle */ },
  "message": "Puzzle updated successfully",
  "user": { "id": "64f5a1b2c3d4e5f6a7b8c9d0" }
}
```

---

### 9. Delete Puzzle
**DELETE** `/puzzles/:id`

Deletes a specific puzzle.

**Parameters:**
- `id` - MongoDB ObjectId

**Response:** `204 No Content`
```json
{
  "success": true,
  "message": "Puzzle deleted successfully",
  "user": { "id": "64f5a1b2c3d4e5f6a7b8c9d0" }
}
```

---

## Common Puzzle Themes

Here are some common puzzle themes you might encounter:

- `mate` - Checkmate puzzles
- `mateIn1`, `mateIn2`, `mateIn3` - Checkmate in N moves
- `endgame` - Endgame positions
- `middlegame` - Middlegame positions
- `opening` - Opening positions
- `fork` - Knight/piece forks
- `pin` - Pinning tactics
- `skewer` - Skewering tactics
- `discoveredAttack` - Discovered attacks
- `doubleCheck` - Double check
- `hangingPiece` - Capturing hanging pieces
- `crushing` - Overwhelming advantage
- `sacrifice` - Piece sacrifices
- `deflection` - Deflecting pieces
- `attraction` - Attracting pieces
- `clearance` - Clearing squares
- `defensiveMove` - Defensive tactics
- `quiet` - Quiet moves
- `zugzwang` - Zugzwang positions

---

## Example Usage

### Create a New Puzzle

```bash
curl -X POST http://localhost:3001/puzzles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "PuzzleId": "12345",
    "FEN": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "Moves": "e2e4 e7e5",
    "Rating": "1200",
    "RatingDeviation": "80",
    "Popularity": "90",
    "NbPlays": "5000",
    "Themes": ["opening", "center"],
    "GameUrl": "https://lichess.org/xxxxx",
    "OpeningTags": "Italian Game",
    "isOpening": true
  }'
```

### Get All Puzzles

```bash
curl -X GET http://localhost:3001/puzzles \
  -H "Authorization: Bearer <token>"
```

### Get Puzzles by Rating (1500-2000)

```bash
curl -X GET "http://localhost:3001/puzzles/rating?min=1500&max=2000" \
  -H "Authorization: Bearer <token>"
```

### Get Endgame Puzzles

```bash
curl -X GET http://localhost:3001/puzzles/theme/endgame \
  -H "Authorization: Bearer <token>"
```

### Get Opening Puzzles

```bash
curl -X GET http://localhost:3001/puzzles/opening \
  -H "Authorization: Bearer <token>"
```

### Update a Puzzle

```bash
curl -X PATCH http://localhost:3001/puzzles/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"Rating": "1900", "Popularity": "95"}'
```

### Delete a Puzzle

```bash
curl -X DELETE http://localhost:3001/puzzles/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>"
```

---

## Error Responses

### 400 Bad Request
Invalid data or validation errors.

```json
{
  "statusCode": 400,
  "message": ["PuzzleId should not be empty"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
Missing or invalid JWT token.

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
Puzzle not found.

```json
{
  "statusCode": 404,
  "message": "Puzzle with ID 507f1f77bcf86cd799439011 not found",
  "error": "Not Found"
}
```

### 409 Conflict
Duplicate PuzzleId.

```json
{
  "statusCode": 409,
  "message": "Puzzle with ID \"00008\" already exists",
  "error": "Conflict"
}
```

---

## Notes

- All endpoints require JWT authentication
- The `PuzzleId` field must be unique across all puzzles
- Themes are stored as an array and can contain multiple values
- Rating fields are stored as strings for precision
- The `_id` field is automatically generated by MongoDB
- Timestamps (`createdAt`, `updatedAt`) are automatically managed
- User information is included in all responses for audit purposes

---

## Integration with Chess Openings

Puzzles with `isOpening: true` are related to chess openings and can be filtered using the `/puzzles/opening` endpoint. The `OpeningTags` field can be used to associate puzzles with specific openings from the chess-openings module.

