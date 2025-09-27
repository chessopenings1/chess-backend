# API Response Format

All APIs in this chess backend now return responses with a consistent format that includes a `success` key.

## Standard Response Format

### Successful Responses
All successful API responses follow this format:
```json
{
  "success": true,
  "data": { /* actual response data */ },
  "message": "Optional success message"
}
```

### Error Responses
Error responses are handled by NestJS and will not include the `success` key, but will have standard HTTP error status codes.

## API Categories

### 1. Authentication APIs (`/auth/*`)
All auth endpoints return:
```json
{
  "success": true,
  "message": "Success message",
  "user": { /* user data */ },
  "access_token": "jwt_token" // only for login
}
```

### 2. Chess Game APIs (`/chess/*`)
All chess endpoints return:
```json
{
  "success": true,
  "data": { /* game data, openings, etc. */ }
}
```

### 3. App Info APIs (`/` and `/api`)
```json
{
  "success": true,
  "message": "Hello message", // for root endpoint
  "data": { /* API info */ }   // for /api endpoint
}
```

## Examples

### Auth Signup Response
```json
{
  "success": true,
  "message": "User created successfully. Please check your email for verification.",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": false
  },
  "verificationToken": "verification_token"
}
```

### Chess Game Creation Response
```json
{
  "success": true,
  "data": {
    "gameId": "game_123",
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "isGameOver": false,
    "currentPlayer": "white"
  }
}
```

### Chess Openings Response
```json
{
  "success": true,
  "data": [
    {
      "id": "opening_1",
      "name": "King's Pawn Opening",
      "category": "Open Games",
      "difficulty": "Beginner",
      "moves": ["e4", "e5"]
    }
  ]
}
```

## Benefits of This Format

1. **Consistency**: All APIs follow the same response structure
2. **Easy Frontend Handling**: Frontend can easily check `response.success` to determine if the request was successful
3. **Clear Data Separation**: Actual data is always in the `data` field
4. **Extensible**: Easy to add additional fields like `pagination`, `metadata`, etc. in the future
