import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable CORS for frontend integration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5175', 'http://localhost:5174', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  console.log(`Chess Backend is running on: http://localhost:${port}`);
  console.log(`MongoDB URI: ${configService.get<string>('MONGODB_URI')?.substring(0, 50)}...`);
}
bootstrap();
