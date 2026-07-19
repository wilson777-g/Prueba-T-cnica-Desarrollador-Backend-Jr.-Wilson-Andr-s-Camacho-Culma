import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../../types/authenticated-user';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatriculaDto, FilterMatriculasDto, UpdateMatriculaEstadoDto } from './dto/matricula.dto';

@Injectable()
export class MatriculasService {
  constructor(private prisma: PrismaService) {}

  findAll(filters: FilterMatriculasDto, user: AuthenticatedUser) {
    const sedeId = (user.rol === 'OPERADOR' ? user.sedeId : filters.sedeId) || undefined;
    if (user.rol === 'OPERADOR' && !sedeId) throw new ForbiddenException('El coordinador no tiene sede asignada');
    return this.prisma.matricula.findMany({
      where: { sedeId, periodo: filters.periodo, estado: filters.estado },
      include: { estudiante: true, programa: true, sede: true },
      orderBy: { fechaMatricula: 'desc' },
    });
  }

  async create(dto: CreateMatriculaDto, user: AuthenticatedUser) {
    if (user.rol === 'OPERADOR' && user.sedeId !== dto.sedeId) {
      throw new ForbiddenException('Solo puedes matricular estudiantes de tu sede');
    }
    const [estudiante, programa, sede] = await Promise.all([
      this.prisma.estudiante.findUnique({ where: { id: dto.estudianteId } }),
      this.prisma.programa.findUnique({ where: { id: dto.programaId } }),
      this.prisma.sede.findUnique({ where: { id: dto.sedeId } }),
    ]);
    if (!estudiante || estudiante.deletedAt) throw new NotFoundException('Estudiante no encontrado');
    if (!programa || programa.estado !== 'ACTIVO') throw new BadRequestException('El programa no está disponible');
    if (!sede || sede.estado !== 'ACTIVA') throw new BadRequestException('La sede no está disponible');
    if (estudiante.sedeId !== dto.sedeId) throw new BadRequestException('El estudiante no pertenece a la sede seleccionada');
    if (estudiante.estado !== 'ACTIVO') throw new BadRequestException('Solo se pueden matricular estudiantes activos');
    try {
      const matricula = await this.prisma.matricula.create({ data: dto, include: { estudiante: true, programa: true, sede: true } });
      await this.prisma.auditLog.create({
        data: { userId: user.id, accion: 'MATRICULA_CREADA', entidad: 'Matricula', entidadId: matricula.id, detalle: { estudianteId: dto.estudianteId, programaId: dto.programaId, sedeId: dto.sedeId, periodo: dto.periodo } },
      });
      return matricula;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('El estudiante ya está matriculado en este programa y periodo');
      }
      throw error;
    }
  }

  async changeStatus(id: string, dto: UpdateMatriculaEstadoDto, user: AuthenticatedUser) {
    const current = await this.prisma.matricula.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Matrícula no encontrada');
    if (user.rol === 'OPERADOR' && user.sedeId !== current.sedeId) throw new ForbiddenException('No puedes modificar otra sede');
    if (current.estado === 'CANCELADA') throw new BadRequestException('Una matrícula cancelada no puede reactivarse');
    const updated = await this.prisma.matricula.update({ where: { id }, data: { estado: dto.estado }, include: { estudiante: true, programa: true, sede: true } });
    await this.prisma.auditLog.create({
      data: { userId: user.id, accion: 'MATRICULA_ESTADO', entidad: 'Matricula', entidadId: id, detalle: { anterior: current.estado, nuevo: dto.estado } },
    });
    return updated;
  }
}
