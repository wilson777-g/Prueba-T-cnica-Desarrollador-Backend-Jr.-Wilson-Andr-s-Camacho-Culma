import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSedeDto, UpdateSedeDto } from './dto/sede.dto';
import { AuthenticatedUser } from '../../types/authenticated-user';

@Injectable()
export class SedesService {
  constructor(private prisma: PrismaService) {}

  async create(createSedeDto: CreateSedeDto) {
    try {
      return await this.prisma.sede.create({
        data: {
          nombre: createSedeDto.nombre.trim(),
          ciudad: createSedeDto.ciudad.trim(),
          direccion: createSedeDto.direccion.trim(),
          estado: createSedeDto.estado || 'ACTIVA',
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Sede con este nombre ya existe');
      }
      throw error;
    }
  }

  async findAll(user: AuthenticatedUser) {
    let where: Prisma.SedeWhereInput | undefined;

    if (user.rol === 'OPERADOR') {
      const sedeId = user.sedeId;

      if (!sedeId) {
        throw new ForbiddenException('El operador no tiene sede asignada');
      }

      where = { id: sedeId };
    }

    return this.prisma.sede.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { estudiantes: true, usuarios: true },
        },
      },
    });
  }

  async findById(id: string, user?: AuthenticatedUser) {
    if (user?.rol === 'OPERADOR' && user.sedeId !== id) {
      throw new ForbiddenException('No puedes consultar sedes de otros operadores');
    }

    const sede = await this.prisma.sede.findUnique({
      where: { id },
      include:
        user?.rol === 'ADMIN'
          ? {
              estudiantes: {
                where: { deletedAt: null },
                select: {
                  id: true,
                  nombreCompleto: true,
                  email: true,
                  estado: true,
                },
              },
              usuarios: {
                where: { deletedAt: null },
                select: {
                  id: true,
                  nombre: true,
                  email: true,
                  rol: true,
                },
              },
            }
          : {
              _count: {
                select: { estudiantes: true, usuarios: true },
              },
            },
    });

    if (!sede) {
      throw new NotFoundException('Sede no encontrada');
    }

    return sede;
  }

  async update(id: string, updateSedeDto: UpdateSedeDto) {
    await this.findById(id);

    try {
      return await this.prisma.sede.update({
        where: { id },
        data: {
          ...updateSedeDto,
          nombre: updateSedeDto.nombre?.trim(),
          ciudad: updateSedeDto.ciudad?.trim(),
          direccion: updateSedeDto.direccion?.trim(),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Nombre de sede ya existe');
      }
      throw error;
    }
  }

  async delete(id: string) {
    await this.findById(id);

    const deleted = await this.prisma.sede.update({
      where: { id },
      data: { estado: 'INACTIVA' },
    });

    return {
      message: 'Sede desactivada',
      sede: deleted,
    };
  }
}
