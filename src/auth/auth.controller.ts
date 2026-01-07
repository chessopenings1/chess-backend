import { Controller, Post, Body, Get, Param, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, ResendVerificationDto, GoogleAuthDto, AdminSignupDto, AdminLoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body(ValidationPipe) signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('resend-verification')
  async resendVerification(@Body(ValidationPipe) resendVerificationDto: ResendVerificationDto) {
    return this.authService.resendVerification(resendVerificationDto);
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('google')
  async googleAuth(@Body(ValidationPipe) googleAuthDto: GoogleAuthDto) {
    return this.authService.googleAuth(googleAuthDto);
  }

  @Post('admin/signup')
  async adminSignup(@Body(ValidationPipe) adminSignupDto: AdminSignupDto) {
    return this.authService.adminSignup(adminSignupDto);
  }

  @Post('admin/login')
  async adminLogin(@Body(ValidationPipe) adminLoginDto: AdminLoginDto) {
    return this.authService.adminLogin(adminLoginDto);
  }
}
