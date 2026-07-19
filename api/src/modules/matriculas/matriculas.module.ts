import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MatriculasController } from './matriculas.controller';
import { MatriculasService } from './matriculas.service';

@Module({ imports: [PrismaModule], controllers: [MatriculasController], providers: [MatriculasService] })
export class MatriculasModule {}
