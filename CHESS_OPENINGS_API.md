# Chess Openings API Documentation

## Base URL
```
http://localhost:3001/chess-openings
```

## Data Structure

Each chess opening contains the following fields:

```typescript
{
  _id: string;                    // MongoDB ObjectId (auto-generated)
  Opening: string;                // Opening name (e.g., "Alekhine Defense, Balogh Variation")
  Colour: "white" | "black";      // Player color
  "Num Games": string;            // Number of games played
  "Perf Rating": string;          // Performance rating
  "Avg Player": string;           // Average player rating
  "Player Win %": string;         // Player win percentage
  "Draw %": string;               // Draw percentage
  "Opponent Win %": string;       // Opponent win percentage
  Moves: string;                  // Moves in algebraic notation (e.g., "1.e4 Nf6 2.e5")
  moves_list: string[];           // Array of individual moves (e.g., ["e4", "Nf6", "e5"])
  "White_win%": string;           // White win percentage
  "Black_win%": string;           // Black win percentage
  slug: string;                   // URL-friendly identifier (unique)
  tags: string[];                 // Array of tags/categories
  createdAt: Date;                // Auto-generated timestamp
  updatedAt: Date;                // Auto-generated timestamp
}
```

## API Endpoints

### 1. Create Chess Opening
**POST** `/chess-openings`

Creates a new chess opening.

**Request Body:**
```json
{
  "Opening": "Sicilian Defense",
  "Colour": "black",
  "Num Games": "1500",
  "Perf Rating": "2300",
  "Avg Player": "2250",
  "Player Win %": "45.5",
  "Draw %": "25.0",
  "Opponent Win %": "29.5",
  "Moves": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4",
  "moves_list": ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4"],
  "White_win%": "29.5",
  "Black_win%": "45.5",
  "slug": "sicilian-defense",
  "tags": ["Sicilian Defense", "Sharp Opening"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": { /* created opening with _id */ },
  "message": "Chess opening created successfully"
}
```

---

### 2. Get All Chess Openings
**GET** `/chess-openings`

Retrieves all chess openings.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ /* array of openings */ ],
  "count": 150
}
```

---

### 3. Get Chess Opening by ID
**GET** `/chess-openings/:id`

Retrieves a specific opening by MongoDB ObjectId.

**Parameters:**
- `id` - MongoDB ObjectId

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* opening object */ }
}
```

---

### 4. Get Chess Opening by Slug
**GET** `/chess-openings/slug/:slug`

Retrieves a specific opening by its slug (URL-friendly identifier).

**Parameters:**
- `slug` - URL-friendly identifier (e.g., "sicilian-defense")

**Example:**
```bash
GET /chess-openings/slug/sicilian-defense
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* opening object */ }
}
```

---

### 5. Get Openings by Color
**GET** `/chess-openings/colour/:colour`

Retrieves all openings for a specific player color.

**Parameters:**
- `colour` - Either `white` or `black`

**Example:**
```bash
GET /chess-openings/colour/white
GET /chess-openings/colour/black
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ /* array of openings for specified color */ ],
  "count": 75
}
```

---

### 6. Search Openings by Name
**GET** `/chess-openings/search?q={searchTerm}`

Searches openings by name (case-insensitive).

**Query Parameters:**
- `q` - Search term

**Example:**
```bash
GET /chess-openings/search?q=sicilian
GET /chess-openings/search?q=defense
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ /* array of matching openings */ ],
  "count": 12
}
```

---

### 7. Get Openings by Tags
**GET** `/chess-openings/tags?tags={tag1,tag2}`

Retrieves openings that match any of the specified tags.

**Query Parameters:**
- `tags` - Comma-separated list of tags

**Example:**
```bash
GET /chess-openings/tags?tags=Sicilian Defense,Italian Game
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ /* array of openings with matching tags */ ],
  "count": 25
}
```

---

### 8. Update Chess Opening
**PATCH** `/chess-openings/:id`

Updates a specific opening (partial update).

**Parameters:**
- `id` - MongoDB ObjectId

**Request Body:** (all fields optional)
```json
{
  "Perf Rating": "2350",
  "Avg Player": "2300",
  "tags": ["Sicilian Defense", "Sharp Opening", "Popular"]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* updated opening */ },
  "message": "Chess opening updated successfully"
}
```

---

### 9. Delete Chess Opening
**DELETE** `/chess-openings/:id`

Deletes a specific opening.

**Parameters:**
- `id` - MongoDB ObjectId

**Response:** `204 No Content`
```json
{
  "success": true,
  "message": "Chess opening deleted successfully"
}
```

---

## Validation Rules

### moves_list Field
- Must be an array of valid chess moves in Standard Algebraic Notation (SAN)
- Each move is validated using chess.js library
- Moves must be playable in sequence on a chess board
- Examples of valid moves: `"e4"`, `"Nf3"`, `"O-O"`, `"Bxf7+"`, `"e8=Q"`

### Colour Field
- Must be either `"white"` or `"black"`
- Case-sensitive

### slug Field
- Must be unique across all openings
- URL-friendly format (lowercase, hyphens)

---

## Error Responses

### 400 Bad Request
Invalid data or validation errors.

```json
{
  "statusCode": 400,
  "message": [
    "Invalid chess move \"xyz\" at position 3. Use standard algebraic notation (e.g., \"e4\", \"Nf3\", \"O-O\")"
  ],
  "error": "Bad Request"
}
```

### 404 Not Found
Resource not found.

```json
{
  "statusCode": 404,
  "message": "Chess opening with ID 507f1f77bcf86cd799439011 not found",
  "error": "Not Found"
}
```

### 409 Conflict
Duplicate slug or unique constraint violation.

```json
{
  "statusCode": 409,
  "message": "Chess opening with slug \"sicilian-defense\" already exists",
  "error": "Conflict"
}
```

---

## Example Usage

### Create a New Opening
```bash
curl -X POST http://localhost:3001/chess-openings \
  -H "Content-Type: application/json" \
  -d '{
    "Opening": "Italian Game",
    "Colour": "white",
    "Num Games": "2000",
    "Perf Rating": "2200",
    "Avg Player": "2180",
    "Player Win %": "38.5",
    "Draw %": "28.0",
    "Opponent Win %": "33.5",
    "Moves": "1.e4 e5 2.Nf3 Nc6 3.Bc4",
    "moves_list": ["e4", "e5", "Nf3", "Nc6", "Bc4"],
    "White_win%": "38.5",
    "Black_win%": "33.5",
    "slug": "italian-game",
    "tags": ["Italian Game", "Classical"]
  }'
```

### Search for Openings
```bash
curl http://localhost:3001/chess-openings/search?q=italian
```

### Get White Openings
```bash
curl http://localhost:3001/chess-openings/colour/white
```

### Get Opening by Slug
```bash
curl http://localhost:3001/chess-openings/slug/italian-game
```

---

## Notes

- All percentage fields are stored as strings for precision
- The `_id` field is automatically generated by MongoDB
- Timestamps (`createdAt`, `updatedAt`) are automatically managed
- The `moves_list` array is validated to ensure all moves are legal chess moves
- The `slug` field must be unique and is used for SEO-friendly URLs

