import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SignupDto, LoginDto, ResendVerificationDto } from './dto/auth.dto';

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
}
