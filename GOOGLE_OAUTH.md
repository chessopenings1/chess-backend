# Google OAuth Integration

This document explains how to use the Google OAuth authentication endpoint.

## Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Configure the OAuth consent screen
6. Create credentials for "Web application"
7. Add authorized JavaScript origins and redirect URIs

### 2. Environment Variables

Add the following to your `.env` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## API Endpoint

### POST `/auth/google`

Authenticate or signup with Google OAuth credentials.

#### Request Body

```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
}
```

The `credential` field should contain the Google ID token obtained from the Google Sign-In JavaScript library.

#### Response

**Success (200):**

```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "isEmailVerified": true,
    "profilePicture": "https://lh3.googleusercontent.com/...",
    "authProvider": "google"
  }
}
```

**Error (401):**

```json
{
  "success": false,
  "message": "Google authentication failed"
}
```

## Frontend Integration

### Using Google Sign-In JavaScript Library

```html
<!-- Load the Google Sign-In library -->
<script src="https://accounts.google.com/gsi/client" async defer></script>

<!-- Google Sign-In Button -->
<div id="g_id_onload"
     data-client_id="YOUR_GOOGLE_CLIENT_ID"
     data-callback="handleCredentialResponse">
</div>
<div class="g_id_signin" data-type="standard"></div>

<script>
  function handleCredentialResponse(response) {
    // Send the credential to your backend
    fetch('http://your-api.com/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credential: response.credential
      })
    })
    .then(response => response.json())
    .then(data => {
      // Store the access_token
      localStorage.setItem('access_token', data.access_token);
      // Redirect or update UI
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
</script>
```

### Using React with @react-oauth/google

```typescript
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function Login() {
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await axios.post('http://your-api.com/auth/google', {
        credential: credentialResponse.credential
      });
      
      // Store token
      localStorage.setItem('access_token', response.data.access_token);
      
      // Redirect or update state
      console.log('Login successful:', response.data);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => {
        console.log('Login Failed');
      }}
    />
  );
}
```

## How It Works

1. **Client**: User clicks "Sign in with Google" button
2. **Google**: Opens OAuth popup and user authenticates
3. **Google**: Returns ID token to client
4. **Client**: Sends ID token to backend `/auth/google` endpoint
5. **Backend**: Verifies ID token with Google
6. **Backend**: Creates or updates user in database
7. **Backend**: Returns JWT access token
8. **Client**: Stores access token for authenticated requests

## Features

- ✅ Automatic user creation for new Google accounts
- ✅ Automatic login for existing Google accounts
- ✅ Merges Google OAuth accounts with default email/password accounts
- ✅ Pre-verified email addresses (Google accounts are verified)
- ✅ Profile picture support
- ✅ Seamless integration with existing authentication system

## Notes

- Google OAuth users are automatically email-verified
- If a user exists with the same email (from default signup), their account will be updated with Google credentials
- Google OAuth users cannot use password login - they must use Google Sign-In
- The backend verifies the Google ID token server-side for security

