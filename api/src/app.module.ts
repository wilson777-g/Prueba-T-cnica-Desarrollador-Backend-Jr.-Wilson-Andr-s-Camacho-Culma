import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { SedesModule } from './modules/sedes/sedes.module';
import { EstudiantesModule } from './modules/estudiantes/estudiantes.module';
import { StatsModule } from './modules/stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRATION: Joi.string().default('1h'),
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
        CORS_ORIGIN: Joi.string().default('http://localhost:3001'),
        RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
        RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
      }),
    }),
    PrismaModule,
    AuthModule,
    SedesModule,
    EstudiantesModule,
    StatsModule,
  ],
})
export class AppModule {}
