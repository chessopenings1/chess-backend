import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Enable CORS for frontend integration
  const allowedOrigins = configService.get<string>('NODE_ENV') === 'production' 
    ? ['https://yourdomain.com', 'https://www.yourdomain.com'] // Add your production domains
    : true; // Allow all origins in development
  
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true, // Allow cookies and authorization headers
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  console.log(`Chess Backend is running on: http://localhost:${port}`);
  console.log(`MongoDB URI: ${configService.get<string>('MONGODB_URI')?.substring(0, 50)}...`);
}
bootstrap();
