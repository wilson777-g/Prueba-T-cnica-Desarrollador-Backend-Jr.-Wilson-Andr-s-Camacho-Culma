import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSedeDto, UpdateSedeDto } from './dto/sede.dto';

@Injectable()
export class SedesService {
  constructor(private prisma: PrismaService) {}

  async create(createSedeDto: CreateSedeDto) {
    try {
      const sede = await this.prisma.sede.create({
        data: {
          nombre: createSedeDto.nombre,
          ciudad: createSedeDto.ciudad,
          direccion: createSedeDto.direccion,
          estado: createSedeDto.estado || 'ACTIVA',
        },
      });
      return sede;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Sede con este nombre ya existe');
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.sede.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { estudiantes: true, usuarios: true },
        },
      },
    });
  }

  async findById(id: string) {
    const sede = await this.prisma.sede.findUnique({
      where: { id },
      include: {
        estudiantes: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            estado: true,
          },
        },
        usuarios: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
    });

    if (!sede) {
      throw new NotFoundException('Sede no encontrada');
    }

    return sede;
  }

  async update(id: string, updateSedeDto: UpdateSedeDto) {
    const sede = await this.findById(id); // Verificar que existe

    try {
      const updated = await this.prisma.sede.update({
        where: { id },
        data: updateSedeDto,
      });
      return updated;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Nombre de sede ya existe');
      }
      throw error;
    }
  }

  async delete(id: string) {
    await this.findById(id); // Verificar que existe

    // Soft delete
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
