# Chess Openings API - Authentication Guide

## Overview

The Chess Openings API now requires JWT authentication. You must obtain a valid access token from the `/auth/login` endpoint before accessing any chess-opening endpoints.

## Authentication Flow

### 1. Sign Up (Create Account)

**POST** `/auth/signup`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully. Please check your email for verification.",
  "user": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": false
  },
  "verificationToken": "abc123..." // Use this to verify email
}
```

### 2. Verify Email

**GET** `/auth/verify-email/:token`

Use the verification token from signup response.

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully.",
  "user": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

### 3. Login (Get Access Token)

**POST** `/auth/login`

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

**Save the `access_token` - you'll need it for all chess-opening API calls.**

---

## Using the Access Token

### Include Token in Headers

For all requests to `/chess-openings/*`, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Example cURL Request

```bash
curl -X GET http://localhost:3001/chess-openings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example with Axios

```javascript
import axios from 'axios';

const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await axios.get('http://localhost:3001/chess-openings', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Example with Fetch

```javascript
const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3001/chess-openings', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

---

## Protected Chess Opening Endpoints

All endpoints under `/chess-openings` now require authentication:

### ✅ Protected Routes (Require JWT Token):

- `POST /chess-openings` - Create opening
- `GET /chess-openings` - Get all openings
- `GET /chess-openings/:id` - Get opening by ID
- `GET /chess-openings/slug/:slug` - Get opening by slug
- `GET /chess-openings/colour/:colour` - Filter by color
- `GET /chess-openings/search?q={term}` - Search openings
- `GET /chess-openings/tags?tags={tag1,tag2}` - Filter by tags
- `PATCH /chess-openings/:id` - Update opening
- `DELETE /chess-openings/:id` - Delete opening

### ❌ Unprotected Routes (No Token Required):

- `POST /auth/signup` - Sign up
- `POST /auth/login` - Login
- `GET /auth/verify-email/:token` - Verify email
- `POST /auth/resend-verification` - Resend verification

---

## Error Responses

### 401 Unauthorized - No Token

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 401 Unauthorized - Invalid Token

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 401 Unauthorized - Email Not Verified

```json
{
  "statusCode": 401,
  "message": "Please verify your email"
}
```

### 401 Unauthorized - Token Expired

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Note:** Tokens expire after 24 hours. You'll need to login again to get a new token.

---

## Complete Workflow Example

### Step 1: Create Account

```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chess Player",
    "email": "player@chess.com",
    "password": "securePass123"
  }'
```

### Step 2: Verify Email

```bash
# Use the verificationToken from signup response
curl -X GET http://localhost:3001/auth/verify-email/abc123verificationToken
```

### Step 3: Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player@chess.com",
    "password": "securePass123"
  }'
```

**Save the access_token from the response!**

### Step 4: Access Chess Openings

```bash
# Export token for convenience
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get all openings
curl -X GET http://localhost:3001/chess-openings \
  -H "Authorization: Bearer $TOKEN"

# Create a new opening
curl -X POST http://localhost:3001/chess-openings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Opening": "Italian Game",
    "Colour": "white",
    "Num Games": 2000,
    "Perf Rating": 2200,
    ...
  }'
```

---

## Troubleshooting

### "Unauthorized" Error

1. Check that you're including the `Authorization` header
2. Verify the token format is `Bearer <token>`
3. Ensure your token hasn't expired (24h expiration)
4. Confirm your email is verified

### "Please verify your email" Error

Complete the email verification step before logging in:
```bash
GET /auth/verify-email/:verificationToken
```

### Token Expired

Login again to get a fresh token:
```bash
POST /auth/login
```

---

## Security Notes

- ✅ Tokens expire after 24 hours
- ✅ Email verification required before login
- ✅ Passwords are hashed with bcrypt
- ✅ JWT tokens are signed with HS256
- ⚠️ Use HTTPS in production
- ⚠️ Store tokens securely (not in localStorage for sensitive apps)
- ⚠️ Implement token refresh mechanism for production

---

## Testing with Postman

1. **Create request** to `/auth/login`
2. **Save the access_token** from response
3. **Set Authorization** → Type: "Bearer Token" → Paste token
4. **Make requests** to chess-opening endpoints

Or use Postman's "Tests" tab to auto-save tokens:

```javascript
// In the /auth/login request's "Tests" tab
pm.environment.set("jwt_token", pm.response.json().access_token);
```

Then in other requests, use: `{{jwt_token}}`

