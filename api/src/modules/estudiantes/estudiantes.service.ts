import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstudianteDto, FilterEstudiantesDto, UpdateEstudianteDto } from './dto/estudiante.dto';

@Injectable()
export class EstudiantesService {
  constructor(private prisma: PrismaService) {}

  async create(createEstudianteDto: CreateEstudianteDto, user: any) {
    this.assertOperatorHasSede(user);

    const sede = await this.prisma.sede.findUnique({
      where: { id: createEstudianteDto.sedeId },
    });

    if (!sede) {
      throw new NotFoundException('Sede no encontrada');
    }

    if (sede.estado !== 'ACTIVA') {
      throw new BadRequestException('No se pueden crear estudiantes en una sede inactiva');
    }

    if (user.rol === 'OPERADOR' && user.sedeId !== createEstudianteDto.sedeId) {
      throw new ForbiddenException('Solo puedes crear estudiantes en tu sede');
    }

    try {
      return await this.prisma.estudiante.create({
        data: {
          nombreCompleto: createEstudianteDto.nombreCompleto.trim(),
          email: createEstudianteDto.email.toLowerCase().trim(),
          telefono: createEstudianteDto.telefono.trim(),
          documento: createEstudianteDto.documento.trim(),
          programa: createEstudianteDto.programa.trim(),
          sedeId: createEstudianteDto.sedeId,
          estado: createEstudianteDto.estado || 'ACTIVO',
        },
        include: { sede: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Email o documento ya registrado');
      }
      throw error;
    }
  }

  async findAll(filters: FilterEstudiantesDto, user: any) {
    this.assertOperatorHasSede(user);

    const page = this.parsePositiveInt(filters.page, 1);
    const limit = Math.min(this.parsePositiveInt(filters.limit, 10), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.EstudianteWhereInput = {
      deletedAt: null,
    };

    if (user.rol === 'OPERADOR') {
      where.sedeId = user.sedeId;
    } else if (filters.sedeId) {
      where.sedeId = filters.sedeId;
    }

    if (filters.estado) {
      where.estado = filters.estado;
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim();
      where.OR = [
        { nombreCompleto: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { documento: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [estudiantes, total] = await Promise.all([
      this.prisma.estudiante.findMany({
        where,
        include: { sede: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.estudiante.count({ where }),
    ]);

    return {
      data: estudiantes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, user: any) {
    this.assertOperatorHasSede(user);

    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
      include: { sede: true },
    });

    if (!estudiante || estudiante.deletedAt) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (user.rol === 'OPERADOR' && user.sedeId !== estudiante.sedeId) {
      throw new ForbiddenException('No puedes ver estudiantes de otras sedes');
    }

    return estudiante;
  }

  async update(id: string, updateEstudianteDto: UpdateEstudianteDto, user: any) {
    await this.findById(id, user);

    try {
      return await this.prisma.estudiante.update({
        where: { id },
        data: {
          nombreCompleto: updateEstudianteDto.nombreCompleto?.trim(),
          email: updateEstudianteDto.email?.toLowerCase().trim(),
          telefono: updateEstudianteDto.telefono?.trim(),
          programa: updateEstudianteDto.programa?.trim(),
          estado: updateEstudianteDto.estado,
        },
        include: { sede: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Email o documento ya registrado');
      }
      throw error;
    }
  }

  async desactivar(id: string, user: any) {
    const estudiante = await this.findById(id, user);

    if (estudiante.estado === 'INACTIVO') {
      throw new BadRequestException('El estudiante ya esta inactivo');
    }

    if (estudiante.estado !== 'ACTIVO') {
      throw new BadRequestException(`No se puede desactivar un estudiante en estado ${estudiante.estado}`);
    }

    const estudianteDesactivado = await this.prisma.estudiante.update({
      where: { id },
      data: { estado: 'INACTIVO' },
      include: { sede: true },
    });

    return {
      message: 'Estudiante desactivado correctamente',
      estudiante: estudianteDesactivado,
    };
  }

  async delete(id: string, user: any) {
    await this.findById(id, user);

    const deleted = await this.prisma.estudiante.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: { sede: true },
    });

    return {
      message: 'Estudiante eliminado',
      estudiante: deleted,
    };
  }

  private assertOperatorHasSede(user: any) {
    if (user.rol === 'OPERADOR' && !user.sedeId) {
      throw new ForbiddenException('El operador no tiene sede asignada');
    }
  }

  private parsePositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value || '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
