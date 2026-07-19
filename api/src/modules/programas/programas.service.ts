import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgramaDto, UpdateProgramaDto } from './dto/programa.dto';

@Injectable()
export class ProgramasService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.programa.findMany({
      include: { _count: { select: { matriculas: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  async create(dto: CreateProgramaDto) {
    try {
      return await this.prisma.programa.create({
        data: { ...dto, codigo: dto.codigo.trim().toUpperCase(), nombre: dto.nombre.trim() },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('El código o nombre del programa ya existe');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateProgramaDto) {
    const exists = await this.prisma.programa.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Programa no encontrado');
    return this.prisma.programa.update({ where: { id }, data: dto });
  }
}
