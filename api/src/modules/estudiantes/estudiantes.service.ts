import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstudianteDto, UpdateEstudianteDto, FilterEstudiantesDto } from './dto/estudiante.dto';

@Injectable()
export class EstudiantesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear estudiante
   * Solo ADMIN puede crear en cualquier sede
   * OPERADOR solo puede crear en su sede
   */
  async create(createEstudianteDto: CreateEstudianteDto, user: any) {
    // Verificar que la sede existe
    const sede = await this.prisma.sede.findUnique({
      where: { id: createEstudianteDto.sedeId },
    });

    if (!sede) {
      throw new NotFoundException('Sede no encontrada');
    }

    // OPERADOR solo puede crear en su sede
    if (user.rol === 'OPERADOR' && user.sedeId !== createEstudianteDto.sedeId) {
      throw new ForbiddenException(
        'Solo puedes crear estudiantes en tu sede',
      );
    }

    try {
      const estudiante = await this.prisma.estudiante.create({
        data: {
          ...createEstudianteDto,
          estado: createEstudianteDto.estado || 'ACTIVO',
        },
      });
      return estudiante;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Email o documento ya registrado');
      }
      throw error;
    }
  }

  /**
   * Obtener estudiantes con filtros y restricción por sede
   * ADMIN ve todos, OPERADOR solo su sede
   */
  async findAll(filters: FilterEstudiantesDto, user: any) {
    const page = parseInt(filters.page || '1');
    const limit = parseInt(filters.limit || '10');
    const skip = (page - 1) * limit;

    const where: any = {};

    // OPERADOR solo ve su sede
    if (user.rol === 'OPERADOR') {
      where.sedeId = user.sedeId;
    } else if (filters.sedeId) {
      // ADMIN puede filtrar por sede
      where.sedeId = filters.sedeId;
    }

    // Filtros adicionales
    if (filters.estado) {
      where.estado = filters.estado;
    }

    if (filters.search) {
      where.OR = [
        { nombreCompleto: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { documento: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Query sin soft delete
    where.deletedAt = null;

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

  /**
   * Obtener un estudiante por ID
   * OPERADOR solo puede ver su sede
   */
  async findById(id: string, user: any) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
      include: { sede: true },
    });

    if (!estudiante || estudiante.deletedAt) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // OPERADOR solo ve su sede
    if (user.rol === 'OPERADOR' && user.sedeId !== estudiante.sedeId) {
      throw new ForbiddenException('No puedes ver estudiantes de otras sedes');
    }

    return estudiante;
  }

  /**
   * Actualizar estudiante
   */
  async update(id: string, updateEstudianteDto: UpdateEstudianteDto, user: any) {
    const estudiante = await this.findById(id, user);

    try {
      const updated = await this.prisma.estudiante.update({
        where: { id },
        data: updateEstudianteDto,
        include: { sede: true },
      });
      return updated;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Email o documento ya registrado');
      }
      throw error;
    }
  }

  /**
   * Eliminar estudiante (soft delete)
   */
  async delete(id: string, user: any) {
    const estudiante = await this.findById(id, user);

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
}
