import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return {
      success: true,
      message: this.appService.getHello()
    };
  }

  @Get('api')
  getApiInfo() {
    return {
      success: true,
      data: {
        name: 'Chess Openings Tutorial API',
        version: '1.0.0',
        description: 'A NestJS backend for chess openings tutorial application',
        endpoints: {
          chess: '/chess',
          openings: '/chess/openings',
          game: '/chess/game',
          auth: '/auth',
        },
      }
    };
  }
}
