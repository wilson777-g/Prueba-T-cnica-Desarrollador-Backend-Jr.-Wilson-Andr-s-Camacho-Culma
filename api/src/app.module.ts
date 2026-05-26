import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    }),
    PrismaModule,
    AuthModule,
    SedesModule,
    EstudiantesModule,
    StatsModule,
  ],
})
export class AppModule {}
