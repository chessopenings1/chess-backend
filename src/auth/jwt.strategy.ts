import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findByEmail(payload.email);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email');
    }

    return { 
      userId: payload.sub, 
      email: payload.email,
      name: user.name 
    };
  }
}

