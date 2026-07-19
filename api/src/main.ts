import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(helmet());

  const allowedOrigins = Array.from(
    new Set([
      process.env.CORS_ORIGIN || 'http://localhost:3001',
      'https://dna-music-web.vercel.app',
      'https://academic-management-web.vercel.app',
    ]),
  );

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(
    '/api/auth/login',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      skipSuccessfulRequests: true,
      message: 'Demasiados intentos de acceso. Intenta nuevamente en 15 minutos.',
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use(
    '/api/',
    rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      message: 'Demasiadas solicitudes. Intenta mas tarde.',
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API ejecutandose en http://localhost:${port}/api`);
}

bootstrap();
