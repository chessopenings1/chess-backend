# Puzzle Solving & Rating System

## Overview

The Chess Puzzle Solving System tracks user progress and calculates puzzle ratings using the **Glicko-2 algorithm**, a modern rating system that accounts for rating deviation and volatility.

## Database Tables

### 1. UserPuzzleSolve (Chess Puzzles Table)

Records every puzzle solve attempt by users.

**Collection:** `userpuzzlesolves`

**Schema:**
```typescript
{
  _id: ObjectId;              // Auto-generated
  userId: ObjectId;           // Reference to User
  puzzleId: ObjectId;         // Reference to Puzzle
  puzzleRating: number;       // Puzzle rating at solve time
  userRatingBefore: number;   // User's rating before solve
  userRatingAfter: number;    // User's rating after solve
  success: boolean;           // Whether solved correctly
  timeSpent: number;          // Time in seconds
  attemptsMade: number;       // Number of attempts
  createdAt: Date;            // Auto-generated
  updatedAt: Date;            // Auto-generated
}
```

### 2. UserPuzzleStats (Users Puzzle Table)

Maintains aggregate stats and Elo rating for each user.

**Collection:** `userpuzzlestats`

**Schema:**
```typescript
{
  _id: ObjectId;              // Auto-generated
  userId: ObjectId;           // Reference to User (unique)
  totalPuzzlesSolved: number; // Count of successfully solved puzzles
  totalPuzzlesAttempted: number; // Total attempts (including failures)
  puzzleRating: number;       // Current Glicko-2 rating (starts at 1500)
  ratingDeviation: number;    // Rating uncertainty (starts at 350)
  volatility: number;         // Rating consistency (starts at 0.06)
  correctSolves: number;      // Number of correct solves
  incorrectSolves: number;    // Number of incorrect solves
  lastSolvedAt: Date;         // Last solve timestamp
  averageTimePerPuzzle: number; // Average time in seconds
  currentStreak: number;      // Current consecutive correct solves
  longestStreak: number;      // Best streak achieved
  createdAt: Date;            // Auto-generated
  updatedAt: Date;            // Auto-generated
}
```

## Glicko-2 Rating System

### What is Glicko-2?

Glicko-2 is an improvement over the traditional Elo system:

- **Rating (r)**: Player's skill level (starts at 1500)
- **Rating Deviation (RD)**: Uncertainty in the rating (starts at 350)
- **Volatility (σ)**: How consistent the player's performance is (starts at 0.06)

### Rating Scale

- **< 1200**: Beginner
- **1200-1500**: Novice
- **1500-1800**: Intermediate
- **1800-2100**: Advanced
- **2100-2400**: Expert
- **2400+**: Master

### How Ratings Update

When a user solves (or fails) a puzzle:

1. **Match Expected Difficulty** → Small rating change
2. **Solve Harder Puzzle** → Large rating increase
3. **Fail Easy Puzzle** → Large rating decrease
4. **Rating Deviation** → Decreases as more puzzles are solved (more certainty)

---

## API Endpoints

### 1. Solve a Puzzle

**POST** `/puzzles/solve`

Records a puzzle solve attempt and updates user stats with Glicko-2 rating.

**Request Body:**
```json
{
  "puzzleId": "507f1f77bcf86cd799439011",
  "success": true,
  "timeSpent": 45,
  "attemptsMade": 2
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "userStats": {
    "totalPuzzlesSolved": 15,
    "totalPuzzlesAttempted": 18,
    "puzzleRating": 1587,
    "ratingDeviation": 285,
    "currentStreak": 3,
    "longestStreak": 8
  },
  "ratingChange": +42,
  "solveRecord": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "success": true,
    "timeSpent": 45,
    "ratingBefore": 1545,
    "ratingAfter": 1587
  }
}
```

---

### 2. Get My Puzzle Stats

**GET** `/puzzles/my-stats`

Retrieves current user's puzzle statistics and rating.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "userId": "64f5a1b2c3d4e5f6a7b8c9d0",
    "totalPuzzlesSolved": 15,
    "totalPuzzlesAttempted": 18,
    "puzzleRating": 1587,
    "ratingDeviation": 285,
    "volatility": 0.059,
    "correctSolves": 15,
    "incorrectSolves": 3,
    "lastSolvedAt": "2025-10-18T10:30:00.000Z",
    "averageTimePerPuzzle": 62,
    "currentStreak": 3,
    "longestStreak": 8,
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-18T10:30:00.000Z"
  },
  "user": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d0"
  }
}
```

---

### 3. Get My Solve History

**GET** `/puzzles/my-history?limit={number}`

Retrieves user's puzzle solve history (most recent first).

**Query Parameters:**
- `limit` (optional) - Number of records to return (default: 50)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
      "userId": "64f5a1b2c3d4e5f6a7b8c9d0",
      "puzzleId": {
        "PuzzleId": "00008",
        "FEN": "r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2R1/PqP2bPP/7K b - - 0 24",
        "Rating": "1807"
      },
      "puzzleRating": 1807,
      "userRatingBefore": 1545,
      "userRatingAfter": 1587,
      "success": true,
      "timeSpent": 45,
      "attemptsMade": 2,
      "createdAt": "2025-10-18T10:30:00.000Z"
    }
  ],
  "count": 1,
  "user": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d0"
  }
}
```

---

### 4. Check if User Solved Puzzle

**GET** `/puzzles/:puzzleId/solved`

Checks if the current user has successfully solved a specific puzzle.

**Parameters:**
- `puzzleId` - MongoDB ObjectId of the puzzle

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "solved": true
  },
  "user": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d0"
  }
}
```

---

### 5. Get Puzzle Solve Count

**GET** `/puzzles/:puzzleId/solve-count`

Gets the total number of times a puzzle has been attempted by all users.

**Parameters:**
- `puzzleId` - MongoDB ObjectId of the puzzle

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "solveCount": 245
  }
}
```

---

## Complete Workflow Example

### 1. User Starts Solving Puzzles

```bash
# Get first puzzle
GET /puzzles?page=1
```

### 2. User Attempts a Puzzle

```bash
# Submit solve attempt
POST /puzzles/solve
{
  "puzzleId": "507f1f77bcf86cd799439011",
  "success": true,
  "timeSpent": 45,
  "attemptsMade": 1
}
```

### 3. System Automatically:

1. ✅ Creates/updates UserPuzzleStats
2. ✅ Calculates new Glicko-2 rating
3. ✅ Updates total puzzles solved count (+1)
4. ✅ Records the solve in UserPuzzleSolve
5. ✅ Updates streak information
6. ✅ Calculates average time

### 4. Check Progress

```bash
# Get current stats
GET /puzzles/my-stats

# Get solve history
GET /puzzles/my-history?limit=10
```

---

## Rating Calculation Details

### Initial State (New User)
```json
{
  "puzzleRating": 1500,
  "ratingDeviation": 350,
  "volatility": 0.06
}
```

### After Solving Easy Puzzle (Rating 1200)
- **Correct**: +20 to +30 points
- **Incorrect**: -10 to -15 points

### After Solving Hard Puzzle (Rating 2000)
- **Correct**: +50 to +80 points
- **Incorrect**: -5 to -10 points

### Rating Deviation
- Starts at **350** (very uncertain)
- Decreases as user solves more puzzles
- Stabilizes around **50-100** for active users
- Lower RD = more stable/confident rating

---

## Statistics Tracked

### Performance Metrics
- `totalPuzzlesSolved` - Successfully solved puzzles
- `totalPuzzlesAttempted` - All attempts (including failures)
- `correctSolves` - Number of correct solves
- `incorrectSolves` - Number of incorrect solves
- **Accuracy**: `correctSolves / totalPuzzlesAttempted * 100`

### Rating Metrics
- `puzzleRating` - Current Glicko-2 rating
- `ratingDeviation` - Rating uncertainty
- `volatility` - Rating consistency

### Engagement Metrics
- `averageTimePerPuzzle` - Average solve time in seconds
- `currentStreak` - Consecutive correct solves
- `longestStreak` - Best streak achieved
- `lastSolvedAt` - Last activity timestamp

---

## Example Usage

### Solve a Puzzle Successfully

```bash
curl -X POST http://localhost:3001/puzzles/solve \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "puzzleId": "507f1f77bcf86cd799439011",
    "success": true,
    "timeSpent": 45,
    "attemptsMade": 1
  }'
```

**Response:**
```json
{
  "success": true,
  "userStats": {
    "totalPuzzlesSolved": 1,
    "totalPuzzlesAttempted": 1,
    "puzzleRating": 1535,
    "ratingDeviation": 340,
    "currentStreak": 1,
    "longestStreak": 1
  },
  "ratingChange": +35,
  "solveRecord": {
    "id": "64f...",
    "success": true,
    "timeSpent": 45,
    "ratingBefore": 1500,
    "ratingAfter": 1535
  }
}
```

### Solve a Puzzle Incorrectly

```bash
curl -X POST http://localhost:3001/puzzles/solve \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "puzzleId": "507f1f77bcf86cd799439011",
    "success": false,
    "timeSpent": 120,
    "attemptsMade": 3
  }'
```

**Response:**
```json
{
  "success": true,
  "userStats": {
    "totalPuzzlesSolved": 1,
    "totalPuzzlesAttempted": 2,
    "puzzleRating": 1515,
    "ratingDeviation": 335,
    "currentStreak": 0,
    "longestStreak": 1
  },
  "ratingChange": -20,
  "solveRecord": {
    "id": "64f...",
    "success": false,
    "timeSpent": 120,
    "ratingBefore": 1535,
    "ratingAfter": 1515
  }
}
```

---

## Frontend Integration

### Track Puzzle Solving

```javascript
// Solve puzzle
const solvePuzzle = async (puzzleId, success, timeSpent) => {
  const response = await axios.post('/puzzles/solve', {
    puzzleId,
    success,
    timeSpent,
    attemptsMade: 1
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const { userStats, ratingChange } = response.data;
  
  // Show rating change to user
  if (ratingChange > 0) {
    showNotification(`+${ratingChange} rating! 🎉`);
  } else {
    showNotification(`${ratingChange} rating`);
  }
  
  // Update UI with new stats
  updateUserStats(userStats);
};
```

### Display User Stats

```javascript
// Get user stats
const getUserStats = async () => {
  const response = await axios.get('/puzzles/my-stats', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const stats = response.data.data;
  
  return {
    rating: stats.puzzleRating,
    solved: stats.totalPuzzlesSolved,
    accuracy: (stats.correctSolves / stats.totalPuzzlesAttempted * 100).toFixed(1),
    streak: stats.currentStreak,
    bestStreak: stats.longestStreak,
    avgTime: stats.averageTimePerPuzzle
  };
};
```

---

## Benefits of Glicko-2

### Advantages Over Standard Elo

1. **Rating Deviation (RD)**
   - Measures confidence in rating
   - Increases during inactivity
   - Decreases as user solves more puzzles

2. **Volatility (σ)**
   - Tracks rating consistency
   - Identifies improving/declining players
   - Adjusts to performance trends

3. **Time-Based Adjustments**
   - Accounts for player inactivity
   - More accurate for casual players

4. **Better for Online Systems**
   - Designed for intermittent play
   - Handles varying activity levels
   - More responsive to actual skill changes

---

## Database Indexes

The system includes optimized indexes:

```typescript
// UserPuzzleSolve: Compound index on userId + puzzleId
{ userId: 1, puzzleId: 1 }

// UserPuzzleStats: Unique index on userId
{ userId: 1 } // unique: true
```

---

## Use Cases

### Gamification
- Show rating changes after each solve
- Display user rank/percentile
- Achievement badges for streaks
- Leaderboards

### Personalization
- Recommend puzzles near user's rating
- Adapt difficulty based on performance
- Track improvement over time

### Analytics
- Track user engagement
- Identify popular puzzles
- Measure puzzle difficulty accuracy
- User retention metrics

---

## Error Handling

### Puzzle Not Found
```json
{
  "statusCode": 404,
  "message": "Puzzle not found",
  "error": "Not Found"
}
```

### Invalid Puzzle ID
```json
{
  "statusCode": 400,
  "message": ["puzzleId should not be empty"],
  "error": "Bad Request"
}
```

---

## Complete Example Flow

```javascript
// 1. Get a puzzle to solve
const puzzle = await getPuzzle();

// 2. User attempts to solve
const startTime = Date.now();
// ... user solves puzzle ...
const endTime = Date.now();
const timeSpent = Math.round((endTime - startTime) / 1000);

// 3. Submit result
const result = await axios.post('/puzzles/solve', {
  puzzleId: puzzle._id,
  success: true,
  timeSpent: timeSpent,
  attemptsMade: 1
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// 4. Show results
console.log(`Rating: ${result.data.userStats.puzzleRating} (${result.data.ratingChange > 0 ? '+' : ''}${result.data.ratingChange})`);
console.log(`Streak: ${result.data.userStats.currentStreak}`);
console.log(`Total Solved: ${result.data.userStats.totalPuzzlesSolved}`);

// 5. Get next puzzle
const nextPuzzle = await getRecommendedPuzzle(result.data.userStats.puzzleRating);
```

---

## Advanced Features

### Get Recommended Puzzles

Filter puzzles based on user rating:

```javascript
const userStats = await getUserStats();
const targetRating = userStats.puzzleRating;

// Get puzzles within ±200 rating points
const puzzles = await getPuzzlesByRatingRange(
  targetRating - 200,
  targetRating + 200
);
```

### Track Progress Over Time

Query solve history to show progress graph:

```javascript
const history = await axios.get('/puzzles/my-history?limit=100', {
  headers: { Authorization: `Bearer ${token}` }
});

const ratingOverTime = history.data.data.map(solve => ({
  date: solve.createdAt,
  rating: solve.userRatingAfter
}));

// Plot rating progression chart
```

---

## Performance Considerations

- ✅ **Atomic Operations** - Rating updates are transactional
- ✅ **Indexed Queries** - Fast lookups with compound indexes
- ✅ **Cached User Stats** - Single document per user
- ✅ **Efficient Calculations** - Glicko-2 is computationally lightweight

---

## Testing the System

### Test Solve Flow

```bash
# 1. Get your stats (should be empty initially)
curl http://localhost:3001/puzzles/my-stats \
  -H "Authorization: Bearer <token>"

# 2. Solve a puzzle
curl -X POST http://localhost:3001/puzzles/solve \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "puzzleId": "507f1f77bcf86cd799439011",
    "success": true,
    "timeSpent": 30,
    "attemptsMade": 1
  }'

# 3. Check updated stats
curl http://localhost:3001/puzzles/my-stats \
  -H "Authorization: Bearer <token>"

# 4. View history
curl http://localhost:3001/puzzles/my-history \
  -H "Authorization: Bearer <token>"
```

---

## Summary

- ✅ **Two tables created**: UserPuzzleSolve (solve records) and UserPuzzleStats (user stats)
- ✅ **Glicko-2 rating system** implemented
- ✅ **Automatic stat updates** on every solve
- ✅ **Streak tracking** for gamification
- ✅ **Average time calculation** for performance metrics
- ✅ **Complete solve history** with populated puzzle data
- ✅ **JWT authentication** on all endpoints
- ✅ **User context** included in all responses

