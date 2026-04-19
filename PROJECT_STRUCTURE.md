# Chess Backend — NestJS Project Structure

> Reference document for Claude. Describes architecture, modules, schemas, DTOs, services, and API contracts.
> Foo
---

## Directory Tree (src/)

```
src/
├── main.ts                          # Bootstrap: ValidationPipe, CORS, port
├── app.module.ts                    # Root module — imports all feature modules
├── app.controller.ts / app.service.ts
│
├── auth/
│   ├── auth.module.ts               # Imports UserModule, PassportModule, JwtModule
│   ├── auth.controller.ts           # Routes: /auth/*
│   ├── auth.service.ts              # Business logic for signup/login/google/admin
│   ├── jwt.strategy.ts              # Passport JWT strategy — validates token, returns user
│   ├── jwt-auth.guard.ts            # Global guard — checks @Public() decorator
│   ├── dto/auth.dto.ts              # SignupDto, LoginDto, GoogleAuthDto, AdminSignupDto, AdminLoginDto
│   └── decorators/
│       ├── get-user.decorator.ts    # @GetUser() param decorator
│       └── public.decorator.ts      # @Public() metadata decorator
│
├── user/
│   ├── user.module.ts
│   ├── user.service.ts              # createUser, findByEmail, verifyEmail, createOrUpdateGoogleUser
│   └── schemas/user.schema.ts       # User Mongoose schema
│
├── lessons/
│   ├── lessons.module.ts
│   ├── lessons.controller.ts        # CRUD routes: /lessons
│   ├── lessons.service.ts           # create, findAll (paginated), findOne, update, remove
│   ├── dto/create-lesson.dto.ts
│   ├── dto/update-lesson.dto.ts
│   ├── dto/move.dto.ts
│   └── schemas/
│       ├── lesson.schema.ts
│       └── move.schema.ts           # Embedded sub-document schema
│
├── courses/
│   ├── courses.module.ts
│   ├── courses.controller.ts        # CRUD + item management: /courses
│   ├── courses.service.ts           # create, findAll (paginated + populated), addItem, removeItem, reorderItems
│   ├── dto/
│   │   ├── create-course.dto.ts
│   │   ├── update-course.dto.ts
│   │   ├── course-item.dto.ts
│   │   └── create-course-with-lessons.dto.ts
│   └── schemas/
│       ├── course.schema.ts
│       └── course-item.schema.ts    # Embedded sub-document schema
│
├── puzzles/
│   ├── puzzles.module.ts
│   ├── puzzles.controller.ts        # All routes require JWT; uses @GetUser()
│   ├── puzzles.service.ts           # CRUD + filtering
│   ├── puzzle-solve.service.ts      # Glicko-2 rating, getRecommendedPuzzle
│   ├── dto/
│   │   ├── create-puzzle.dto.ts
│   │   ├── update-puzzle.dto.ts
│   │   └── solve-puzzle.dto.ts
│   └── schemas/
│       ├── puzzle.schema.ts
│       ├── user-puzzle-stats.schema.ts
│       └── user-puzzle-solve.schema.ts
│
├── stockfish/
│   ├── stockfish.module.ts
│   ├── stockfish.controller.ts      # /stockfish/analyze, /best-move, /evaluate, /health
│   ├── stockfish.service.ts         # Proxies to chess-api.com (NOT local binary)
│   └── dto/analyze-position.dto.ts
│
└── chess/                           # Legacy chess opening module
    ├── chess-opening.module.ts
    ├── chess-opening.controller.ts
    ├── chess-opening.service.ts
    ├── schemas/chess-opening.schema.ts
    ├── dto/
    │   ├── create-opening.dto.ts
    │   └── update-opening.dto.ts
    └── validators/chess-moves.validator.ts
```

---

## Bootstrap (`main.ts`)

- Port: `process.env.PORT` or `3001`
- **Global `ValidationPipe`**: `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`
- **CORS**: all origins in development; restricted to production domains in production (`NODE_ENV === 'production'`)
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
- `credentials: true`

---

## Authentication

### JWT Strategy (`auth/jwt.strategy.ts`)
- Extracts token from `Authorization: Bearer <token>`
- Validates against `JWT_SECRET` env var
- Calls `userService.findByEmail(payload.email)`
- Throws `UnauthorizedException` if user not found or email not verified
- Returns `{ userId: payload.sub, email, name }` attached to `request.user`

### `JwtAuthGuard` (`auth/jwt-auth.guard.ts`)
- Applied per-controller or globally
- Checks for `@Public()` metadata — skips auth for public routes
- Puzzles controller applies `@UseGuards(JwtAuthGuard)` at class level

### `@GetUser()` decorator (`auth/decorators/get-user.decorator.ts`)
- Custom param decorator, returns `request.user` (or specific field if provided)
- Usage: `@GetUser() user: AuthenticatedUser`
- `AuthenticatedUser` interface: `{ userId: string; email: string; name: string }`

### Auth Flows

| Flow | Endpoint | Notes |
|---|---|---|
| User signup | `POST /auth/signup` | Creates user, returns `verificationToken` (dev only) |
| User login | `POST /auth/login` | Requires `isEmailVerified`; rejects Google-only accounts |
| Google OAuth | `POST /auth/google` | Verifies Google ID token via `google-auth-library` |
| Email verify | `GET /auth/verify-email/:token` | Token expires in 24h |
| Resend verify | `POST /auth/resend-verification` | |
| Admin signup | `POST /auth/admin/signup` | Creates or upgrades user to admin |
| Admin login | `POST /auth/admin/login` | Checks `isAdmin: true`; returns JWT with `isAdmin: true` in payload |

JWT expiry: **24 hours**

---

## MongoDB Schemas

### `User` (`user/schemas/user.schema.ts`)
| Field | Type | Default | Notes |
|---|---|---|---|
| name | String | required | trimmed |
| email | String | required, unique | lowercase, trimmed |
| password | String? | — | bcrypt hashed (10 rounds) |
| isEmailVerified | Boolean | false | |
| emailVerificationToken | String? | — | cleared on verify |
| emailVerificationExpires | Date? | — | 24h window |
| googleId | String? | — | |
| profilePicture | String? | — | |
| authProvider | String | `'local'` | `'local'` or `'google'` |
| isAdmin | Boolean | false | |

Timestamps: `createdAt`, `updatedAt` auto-managed.

### `Lesson` (`lessons/schemas/lesson.schema.ts`)
| Field | Type | Notes |
|---|---|---|
| starting_fen | String | required |
| name | String | required |
| tags | String[] | default [] |
| moves | Move[] | embedded sub-documents |
| turn | String | enum: `'black'`, `'white'` |
| prompts | String[] | default [] |

### `Move` (`lessons/schemas/move.schema.ts`) — `_id: false`
| Field | Type | Notes |
|---|---|---|
| type | String | enum: `'square'`, `'move'`, `'highlight'` |
| square | String | default `''`; used for `square`/`highlight` types |
| player_action | String | default `''`; used for `move` type (UCI: `"e2e4"`) |
| opp_action | String? | optional opponent response (UCI) |
| prompts | String[] | default [] |

### `Course` (`courses/schemas/course.schema.ts`)
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| type | String | required |
| difficulty | String | required |
| tags | String[] | default [] |
| items | CourseItem[] | embedded sub-documents |
| prompts | String[] | default [] |

### `CourseItem` (`courses/schemas/course-item.schema.ts`) — `_id: false`
| Field | Type | Notes |
|---|---|---|
| type | String | enum: `'lesson'`, `'puzzle'` |
| itemId | ObjectId | references Lesson or Puzzle |
| order | Number | required |

### `Puzzle` (`puzzles/schemas/puzzle.schema.ts`)
| Field | Type | Notes |
|---|---|---|
| PuzzleId | String | unique — Lichess puzzle ID |
| FEN | String | required |
| Moves | String[] | required; UCI format (space-separated in raw CSV, stored as array) |
| Rating | Number | |
| RatingDeviation | Number | |
| Popularity | Number | |
| NbPlays | Number | |
| Themes | String[] | |
| GameUrl | String | |
| OpeningTags | String | default `''` |
| isOpening | Boolean | default false |

**Note:** Field names are PascalCase (matching Lichess CSV format). `PuzzleId` is the Lichess ID; `_id` is the MongoDB ObjectId.

### `UserPuzzleStats` (`puzzles/schemas/user-puzzle-stats.schema.ts`)
- `userId` (ObjectId, unique, ref: User)
- `puzzleRating` (default 1500), `ratingDeviation` (default 350), `volatility` (default 0.06) — Glicko-2 params
- `totalPuzzlesSolved`, `totalPuzzlesAttempted`, `correctSolves`, `incorrectSolves`
- `currentStreak`, `longestStreak`, `lastSolvedAt`, `averageTimePerPuzzle`

### `UserPuzzleSolve` (`puzzles/schemas/user-puzzle-solve.schema.ts`)
- `userId`, `puzzleId` (ObjectId refs)
- `puzzleRating`, `userRatingBefore`, `userRatingAfter`, `success`, `timeSpent`, `attemptsMade?`
- Compound index: `{ userId: 1, puzzleId: 1 }`

---

## API Endpoints

All responses follow: `{ success: true, data: ..., message?: ... }` unless noted.

### Auth (`/auth`)
| Method | Route | Auth | Body DTO | Notes |
|---|---|---|---|---|
| POST | `/auth/signup` | No | `SignupDto` | Returns user + verificationToken |
| POST | `/auth/login` | No | `LoginDto` | Returns `access_token` + user |
| POST | `/auth/google` | No | `GoogleAuthDto` | `credential` = Google ID token |
| GET | `/auth/verify-email/:token` | No | — | Verifies email |
| POST | `/auth/resend-verification` | No | `ResendVerificationDto` | |
| POST | `/auth/admin/signup` | No | `AdminSignupDto` | Creates/upgrades admin |
| POST | `/auth/admin/login` | No | `AdminLoginDto` | Returns `access_token` |

**Login response shape**: `{ success, access_token, user: { id, name, email, isEmailVerified, isAdmin } }`

### Lessons (`/lessons`) — No auth guard
| Method | Route | Query Params | Notes |
|---|---|---|---|
| POST | `/lessons` | — | `CreateLessonDto` |
| GET | `/lessons` | `page`, `limit`, `tags` | Paginated; tags = comma-separated |
| GET | `/lessons/:id` | — | |
| PATCH | `/lessons/:id` | — | `UpdateLessonDto` |
| DELETE | `/lessons/:id` | — | |

**`CreateLessonDto`**: `starting_fen`, `name`, `turn` (enum), `tags?`, `moves?`, `prompts?`

**Paginated response**: `{ lessons, total, page, totalPages }`

### Courses (`/courses`) — No auth guard
| Method | Route | Notes |
|---|---|---|
| POST | `/courses` | `CreateCourseDto`; validates all itemIds exist |
| POST | `/courses/with-lessons` | `CreateCourseWithLessonsDto`; creates lessons then course atomically |
| GET | `/courses` | `page`, `limit`, `tags`, `type`, `difficulty`; returns populated items |
| GET | `/courses/:id` | Returns populated items (lesson/puzzle docs inline) |
| PATCH | `/courses/:id` | `UpdateCourseDto` |
| DELETE | `/courses/:id` | |
| POST | `/courses/:id/items` | Body: `{ type, itemId }` — appends item |
| DELETE | `/courses/:id/items/:type/:itemId` | Removes item + reorders |
| PATCH | `/courses/:id/items/reorder` | Body: `{ items: [{itemId, type, order}] }` |

**Populated course items shape**: `{ type, itemId, order, item: <Lesson|Puzzle doc> }` sorted by `order`.

### Puzzles (`/puzzles`) — All routes require JWT (`@UseGuards(JwtAuthGuard)`)
| Method | Route | Notes |
|---|---|---|
| GET | `/puzzles/next` | Recommended puzzle via Glicko-2 + calibration logic |
| GET | `/puzzles/opening` | `isOpening: true` |
| GET | `/puzzles/rating?min=&max=` | Filter by rating range |
| GET | `/puzzles/theme/:theme` | Regex search on Themes array |
| GET | `/puzzles/puzzle-id/:puzzleId` | Lookup by Lichess PuzzleId |
| GET | `/puzzles/my-stats` | Returns `UserPuzzleStats` for current user |
| GET | `/puzzles/my-history?limit=` | Returns `UserPuzzleSolve[]` with puzzle populated |
| GET | `/puzzles/:id/solved` | Returns `{ solved: boolean }` |
| GET | `/puzzles/:id/solve-count` | Returns `{ solveCount: number }` |
| POST | `/puzzles/solve` | `SolvePuzzleDto`; applies Glicko-2 rating update |
| GET | `/puzzles` | Paginated (default limit 1000) |
| GET | `/puzzles/:id` | By MongoDB `_id` |
| POST | `/puzzles` | Create puzzle |
| PATCH | `/puzzles/:id` | |
| DELETE | `/puzzles/:id` | 204 No Content |

**`SolvePuzzleDto`**: `puzzleId` (MongoDB `_id`), `success` (0 or 1), `timeSpent` (seconds), `attemptsMade?`

**Solve response**: `{ success, userStats: {...}, ratingChange, solveRecord: {...} }`

### Stockfish (`/stockfish`) — No auth guard
| Method | Route | Notes |
|---|---|---|
| POST | `/stockfish/analyze` | Returns `{ bestMove, score, depth, mate?, pv[] }` |
| POST | `/stockfish/best-move` | Returns `{ bestMove }` |
| POST | `/stockfish/evaluate` | Returns `{ evaluation }` (centipawns / 100) |
| GET | `/stockfish/health` | Probes chess-api.com |

**`AnalyzePositionDto`**: `fen` (required), `depth?` (1–20, default 15), `searchMoves?`

> **Important**: Despite the module name `StockfishModule`, the service does NOT use a local Stockfish binary. It proxies requests to the external `https://chess-api.com/v1` REST API. Max depth: 18.

---

## Puzzle Recommendation Algorithm (`puzzle-solve.service.ts`)

### Calibration phase (first 10 puzzles):
- Puzzle 0: Start at rating 1500 ± 100
- Puzzle 1: ±200 based on previous result
- Puzzles 2–4: Adjust ±150–300 based on recent success rate (thresholds: 80%, 60%, 40%)
- Puzzles 5–9: Fine-tune ±75–150 (thresholds: 70%, 50%, 30%)

### Post-calibration (10+ puzzles):
- Progressive search with expanding ranges: 5%, 10%, 15%, 20%, 30%, 50%, 75%, 100% of user rating
- Excludes all previously attempted puzzles (`$nin`)
- Throws `NotFoundException` if no puzzle found even at 100% range

### Rating update:
- Uses **Glicko-2** library (`glicko2` npm package)
- Default: rating=1500, rd=350, vol=0.06, tau=0.5
- `success`: 1 = win (solved), 0 = loss (failed)
- Updates `UserPuzzleStats` and creates `UserPuzzleSolve` record

---

## DTOs Summary

| DTO | Fields |
|---|---|
| `SignupDto` | `name` (min 2), `email`, `password` (min 6), `isAdmin?` |
| `LoginDto` | `email`, `password` |
| `AdminSignupDto` | `name`, `email`, `password` |
| `AdminLoginDto` | `email`, `password` |
| `GoogleAuthDto` | `credential` (Google ID token string) |
| `CreateLessonDto` | `starting_fen`, `name`, `turn` (enum), `tags?`, `moves?: MoveDto[]`, `prompts?` |
| `MoveDto` | `type` (enum), `square?`, `player_action?`, `opp_action?`, `prompts?` |
| `CreateCourseDto` | `name`, `type`, `difficulty`, `tags?`, `items?: CourseItemDto[]`, `prompts?` |
| `CourseItemDto` | `type` (enum), `itemId`, `order` |
| `CreateCourseWithLessonsDto` | `name`, `type`, `difficulty`, `tags?`, `lessons: CreateLessonDto[]`, `prompts?` |
| `SolvePuzzleDto` | `puzzleId`, `success` (0 or 1), `timeSpent`, `attemptsMade?` |
| `AnalyzePositionDto` | `fen`, `depth?` (max 20), `searchMoves?` |

---

## Environment Variables (`.env`)

```
MONGODB_URI=<mongodb-atlas-connection-string>
PORT=3001
NODE_ENV=development|production
JWT_SECRET=<secret-key>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
```

---

## Key Dependencies

| Package | Purpose |
|---|---|
| `@nestjs/mongoose` + `mongoose` | MongoDB ODM |
| `@nestjs/passport` + `passport-jwt` | JWT authentication |
| `@nestjs/jwt` | JWT signing/verification |
| `bcryptjs` | Password hashing (10 rounds) |
| `google-auth-library` | Google ID token verification |
| `glicko2` | Glicko-2 rating system for puzzles |
| `axios` | HTTP client for chess-api.com proxy |
| `class-validator` + `class-transformer` | DTO validation |

---

## Response Envelope Convention

All controllers wrap responses in:
```json
{ "success": true, "data": ..., "message": "..." }
```
Errors use NestJS built-in exception filters (standard HTTP exceptions).

---

## Important Notes

1. **Email verification is required** for login — `isEmailVerified` must be true. The `verificationToken` is currently returned in responses (dev convenience; must be removed for production).
2. **Stockfish module name is misleading** — no local binary is used; all analysis proxies to `chess-api.com`.
3. **Puzzle Rating field is stored as a Number** in the schema but queried with string comparison (`$gte: "1200"`) — this is a bug in `puzzles.service.ts` and `puzzle-solve.service.ts`.
4. **`CoursesService.populateItems()`** manually fetches lesson/puzzle docs per item — no Mongoose populate. Results sorted by `order` field.
5. **`courses/with-lessons`** endpoint creates all lessons atomically, then the course. No transaction — partial failure is possible.
6. **`GET /puzzles/foo`** is a dev utility endpoint that seeds 10,000 puzzles from a local JSON file (`lichess_db_puzzle-1.json`).
