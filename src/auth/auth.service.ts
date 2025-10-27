import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SignupDto, LoginDto, ResendVerificationDto, GoogleAuthDto } from './dto/auth.dto';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { name, email, password } = signupDto;
    
    const user = await this.userService.createUser(name, email, password);
    
    // In a real application, you would send an email here
    // For now, we'll just return the verification token
    return {
      success: true,
      message: 'User created successfully. Please check your email for verification.',
      user: {
        id: (user as any)._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
      verificationToken: user.emailVerificationToken, // Remove this in production
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is Google OAuth user
    if (user.authProvider === 'google') {
      throw new BadRequestException('Please use Google Sign-In for this account');
    }

    // Check if user has a password
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userService.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new BadRequestException('Please verify your email before logging in');
    }

    const payload = { email: user.email, sub: (user as any)._id };
    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      access_token: accessToken,
      user: {
        id: (user as any)._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async resendVerification(resendVerificationDto: ResendVerificationDto) {
    const { email } = resendVerificationDto;
    
    const user = await this.userService.resendVerificationToken(email);
    
    // In a real application, you would send an email here
    return {
      success: true,
      message: 'Verification email sent successfully.',
      verificationToken: user.emailVerificationToken, // Remove this in production
    };
  }

  async verifyEmail(token: string) {
    const user = await this.userService.verifyEmail(token);
    
    return {
      success: true,
      message: 'Email verified successfully.',
      user: {
        id: (user as any)._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async googleAuth(googleAuthDto: GoogleAuthDto) {
    const { credential } = googleAuthDto;

    try {
      // Verify the Google ID token
      const client = new OAuth2Client();
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID, // You'll need to set this in your .env
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const { sub: googleId, email, name, picture } = payload;

      if (!email || !name || !googleId) {
        throw new BadRequestException('Invalid Google token payload');
      }

      // Find or create user
      const user = await this.userService.createOrUpdateGoogleUser(
        googleId,
        email,
        name,
        picture
      );

      // Generate JWT token
      const jwtPayload = { email: user.email, sub: (user as any)._id };
      const accessToken = this.jwtService.sign(jwtPayload);

      return {
        success: true,
        access_token: accessToken,
        user: {
          id: (user as any)._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          profilePicture: user.profilePicture,
          authProvider: user.authProvider,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('Google authentication failed');
    }
  }
}
