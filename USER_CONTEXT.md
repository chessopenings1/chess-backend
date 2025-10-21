# User Context in Chess Opening APIs

## Overview

All authenticated chess-opening API endpoints now include user context from the JWT token. The user information is automatically extracted and available in every API call.

## User Information Available

When a valid JWT token is provided, the following user information is extracted:

```typescript
{
  userId: string;    // MongoDB User ID
  email: string;     // User's email address
  name: string;      // User's full name
}
```

## Using the @GetUser() Decorator

The `@GetUser()` decorator extracts user information from the JWT token in the request.

### Basic Usage

```typescript
@Get()
async findAll(@GetUser() user: AuthenticatedUser) {
  console.log(`User ${user.userId} is accessing this endpoint`);
  // user.userId, user.email, user.name are all available
}
```

### Get Specific User Field

You can also extract just a specific field:

```typescript
@Post()
async create(
  @Body() createDto: CreateDto,
  @GetUser('userId') userId: string,  // Get only userId
) {
  console.log(`Creating opening for user: ${userId}`);
}

// Or get just the email
@Get()
async findAll(@GetUser('email') userEmail: string) {
  console.log(`User email: ${userEmail}`);
}
```

## API Response Format

All authenticated endpoints now return the user information in the response:

### Example Response

```json
{
  "success": true,
  "data": {
    "Opening": "Sicilian Defense",
    "Colour": "black",
    // ... opening data
  },
  "user": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## Logging

All authenticated endpoints now log user activity:

```
User 64f5a1b2c3d4e5f6a7b8c9d0 (user@example.com) is creating a chess opening
User 64f5a1b2c3d4e5f6a7b8c9d0 is fetching all chess openings
User 64f5a1b2c3d4e5f6a7b8c9d0 is updating opening 507f1f77bcf86cd799439011
User 64f5a1b2c3d4e5f6a7b8c9d0 is deleting opening 507f1f77bcf86cd799439011
```

These logs can be used for:
- Audit trails
- Monitoring user activity
- Debugging
- Analytics

## Example API Calls with User Context

### 1. Create Chess Opening

**Request:**
```bash
curl -X POST http://localhost:3001/chess-openings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "Opening": "Italian Game",
    "Colour": "white",
    ...
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "Opening": "Italian Game",
    ...
  },
  "message": "Chess opening created successfully",
  "user": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 2. Get All Openings

**Request:**
```bash
curl -X GET http://localhost:3001/chess-openings \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": [ /* array of openings */ ],
  "count": 150,
  "user": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com"
  }
}
```

### 3. Update Opening

**Request:**
```bash
curl -X PATCH http://localhost:3001/chess-openings/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"Perf Rating": 2350}'
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated opening */ },
  "message": "Chess opening updated successfully",
  "user": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d0"
  }
}
```

## Use Cases for User Context

### 1. Audit Trail

Track who created, modified, or deleted openings:

```typescript
async create(
  @Body() dto: CreateChessOpeningDto,
  @GetUser() user: AuthenticatedUser,
) {
  console.log(`[AUDIT] User ${user.userId} created opening: ${dto.Opening}`);
  // Save to audit log database
  await this.auditService.log({
    userId: user.userId,
    action: 'CREATE_OPENING',
    resource: dto.Opening,
    timestamp: new Date()
  });
}
```

### 2. User-Specific Resources

Associate openings with users:

```typescript
async create(
  @Body() dto: CreateChessOpeningDto,
  @GetUser() user: AuthenticatedUser,
) {
  const opening = await this.service.create({
    ...dto,
    createdBy: user.userId,  // Add user association
    createdByEmail: user.email
  });
}
```

### 3. Authorization Checks

Ensure users can only modify their own resources:

```typescript
async update(
  @Param('id') id: string,
  @Body() dto: UpdateChessOpeningDto,
  @GetUser() user: AuthenticatedUser,
) {
  const opening = await this.service.findOne(id);
  
  // Check if user owns this resource
  if (opening.createdBy !== user.userId) {
    throw new ForbiddenException('You can only update your own openings');
  }
  
  return await this.service.update(id, dto);
}
```

### 4. User Analytics

Track user behavior:

```typescript
async findAll(@GetUser() user: AuthenticatedUser) {
  // Track this user's activity
  await this.analyticsService.trackUserAction({
    userId: user.userId,
    action: 'VIEW_ALL_OPENINGS',
    timestamp: new Date()
  });
  
  return await this.service.findAll();
}
```

## TypeScript Interface

The `AuthenticatedUser` interface is defined in the controller:

```typescript
export interface AuthenticatedUser {
  userId: string;   // From JWT payload 'sub' field
  email: string;    // From JWT payload 'email' field
  name: string;     // From user database
}
```

This interface matches what the JWT strategy returns after validating the token.

## Security Notes

1. ✅ **User ID is verified** - Extracted from validated JWT token
2. ✅ **Cannot be spoofed** - JWT signature is verified
3. ✅ **Email verification required** - Only verified users can get tokens
4. ✅ **Token expiration** - Tokens expire after 24 hours
5. ✅ **User existence checked** - Strategy validates user still exists

## Extending User Context

To add more fields to the user context:

### 1. Update JWT Strategy

```typescript
// src/auth/jwt.strategy.ts
async validate(payload: any) {
  const user = await this.userService.findByEmail(payload.email);
  
  return { 
    userId: payload.sub, 
    email: payload.email,
    name: user.name,
    role: user.role,        // ← Add new field
    premium: user.premium   // ← Add new field
  };
}
```

### 2. Update Interface

```typescript
// src/chess/chess-opening.controller.ts
export interface AuthenticatedUser {
  userId: string;
  email: string;
  name: string;
  role?: string;     // ← Add new field
  premium?: boolean; // ← Add new field
}
```

### 3. Use in Controllers

```typescript
@Get()
async findAll(@GetUser() user: AuthenticatedUser) {
  if (user.role === 'admin') {
    // Show all openings including private ones
  } else if (user.premium) {
    // Show premium openings
  } else {
    // Show only public openings
  }
}
```

## Best Practices

1. **Always use @GetUser()** for user context instead of manually parsing JWT
2. **Log user actions** for audit trails and debugging
3. **Include user info in responses** so frontend knows who made the request
4. **Validate ownership** before allowing updates/deletes
5. **Use userId for database queries** to filter user-specific data
6. **Cache user data** if making multiple user lookups per request

## Example: Complete User-Owned Resource

```typescript
@Controller('chess-openings')
@UseGuards(JwtAuthGuard)
export class ChessOpeningController {
  
  @Post()
  async create(
    @Body() dto: CreateChessOpeningDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    // Add user ownership
    const opening = await this.service.create({
      ...dto,
      createdBy: user.userId,
      createdAt: new Date()
    });
    
    return {
      success: true,
      data: opening,
      user: { id: user.userId, email: user.email }
    };
  }
  
  @Get('my-openings')
  async getMyOpenings(@GetUser('userId') userId: string) {
    // Get only this user's openings
    return await this.service.findByUserId(userId);
  }
  
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const opening = await this.service.findOne(id);
    
    // Authorization check
    if (opening.createdBy !== user.userId) {
      throw new ForbiddenException('Not authorized');
    }
    
    await this.service.remove(id);
    return { success: true, message: 'Deleted' };
  }
}
```

