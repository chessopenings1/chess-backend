# Authentication API Endpoints

## Base URL
`http://localhost:3001/auth`

## Endpoints

### 1. Signup
**POST** `/signup`

Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
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

### 2. Login
**POST** `/login`

Authenticates a user and returns an access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "jwt_token",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

### 3. Resend Verification
**POST** `/resend-verification`

Resends email verification token.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent successfully.",
  "verificationToken": "new_verification_token"
}
```

### 4. Verify Email
**GET** `/verify-email/:token`

Verifies user email using the verification token.

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully.",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

## Environment Variables

Make sure to set these environment variables in your `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/chess-backend
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3001
```

## Notes

- Passwords are hashed using bcryptjs
- JWT tokens expire after 24 hours
- Email verification tokens expire after 24 hours
- In production, remove the `verificationToken` from responses and implement actual email sending
