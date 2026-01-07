import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class ResendVerificationDto {
  @IsEmail()
  email: string;
}

export class GoogleAuthDto {
  @IsNotEmpty()
  @IsString()
  credential: string; // Google ID token
}

export class AdminSignupDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class AdminLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
