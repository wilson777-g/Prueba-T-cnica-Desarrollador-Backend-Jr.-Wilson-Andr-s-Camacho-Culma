import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstudianteDto, FilterEstudiantesDto, UpdateEstudianteDto } from './dto/estudiante.dto';
import { AuthenticatedUser } from '../../types/authenticated-user';

@Injectable()
export class EstudiantesService {
  constructor(private prisma: PrismaService) {}

  async create(createEstudianteDto: CreateEstudianteDto, user: AuthenticatedUser) {
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

  async findAll(filters: FilterEstudiantesDto, user: AuthenticatedUser) {
    this.assertOperatorHasSede(user);

    const page = this.parsePositiveInt(filters.page, 1);
    const limit = Math.min(this.parsePositiveInt(filters.limit, 10), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.EstudianteWhereInput = {
      deletedAt: null,
    };

    if (user.rol === 'OPERADOR') {
      if (!user.sedeId) {
        throw new ForbiddenException('El operador no tiene sede asignada');
      }

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

  async findById(id: string, user: AuthenticatedUser) {
    this.assertOperatorHasSede(user);

    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
      include: { sede: true, matriculas: { include: { programa: true, sede: true }, orderBy: { fechaMatricula: 'desc' } } },
    });

    if (!estudiante || estudiante.deletedAt) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (user.rol === 'OPERADOR' && user.sedeId !== estudiante.sedeId) {
      throw new ForbiddenException('No puedes ver estudiantes de otras sedes');
    }

    return estudiante;
  }

  async update(id: string, updateEstudianteDto: UpdateEstudianteDto, user: AuthenticatedUser) {
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

  async desactivar(id: string, user: AuthenticatedUser) {
    return this.marcarInactivo(id, user, 'desactivar', 'Estudiante desactivado correctamente');
  }

  async suspender(id: string, user: AuthenticatedUser) {
    return this.marcarInactivo(id, user, 'suspender', 'Estudiante suspendido correctamente');
  }

  async delete(id: string, user: AuthenticatedUser) {
    await this.findById(id, user);

    const deleted = await this.prisma.estudiante.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: { sede: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        accion: 'ESTUDIANTE_ELIMINADO',
        entidad: 'Estudiante',
        entidadId: id,
        detalle: { nombreCompleto: deleted.nombreCompleto, documento: deleted.documento },
      },
    });

    return {
      message: 'Estudiante eliminado',
      estudiante: deleted,
    };
  }

  private async marcarInactivo(
    id: string,
    user: AuthenticatedUser,
    accion: 'desactivar' | 'suspender',
    successMessage: string,
  ) {
    const estudiante = await this.findById(id, user);

    if (estudiante.estado === 'INACTIVO') {
      throw new BadRequestException('El estudiante ya esta inactivo');
    }

    if (estudiante.estado === 'RETIRADO') {
      throw new BadRequestException(`No se puede ${accion} un estudiante retirado`);
    }

    if (estudiante.estado !== 'ACTIVO') {
      throw new BadRequestException(`No se puede ${accion} un estudiante en estado ${estudiante.estado}`);
    }

    const estudianteActualizado = await this.prisma.estudiante.update({
      where: { id },
      data: { estado: 'INACTIVO' },
      include: { sede: true },
    });

    return {
      message: successMessage,
      estudiante: estudianteActualizado,
    };
  }

  private assertOperatorHasSede(user: AuthenticatedUser) {
    if (user.rol === 'OPERADOR' && !user.sedeId) {
      throw new ForbiddenException('El operador no tiene sede asignada');
    }
  }

  private parsePositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value || '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
