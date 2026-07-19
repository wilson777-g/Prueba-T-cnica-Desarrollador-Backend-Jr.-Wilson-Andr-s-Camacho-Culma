import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuditFilterDto, CreateOperadorDto, UpdateOperadorDto } from './dto/administracion.dto';
import { AuthenticatedUser } from '../../types/authenticated-user';

@Injectable()
export class AdministracionService {
  constructor(private prisma: PrismaService) {}

  findOperadores() {
    return this.prisma.user.findMany({
      where: { rol: 'OPERADOR', deletedAt: null },
      select: { id: true, nombre: true, email: true, rol: true, sedeId: true, sede: true, activo: true, ultimoLogin: true, createdAt: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async createOperador(dto: CreateOperadorDto, actor: AuthenticatedUser) {
    const sede = await this.prisma.sede.findUnique({ where: { id: dto.sedeId } });
    if (!sede || sede.estado !== 'ACTIVA') throw new BadRequestException('La sede seleccionada no está disponible');
    try {
      return await this.prisma.$transaction(async tx => {
        const created = await tx.user.create({ data: { nombre: dto.nombre.trim(), email: dto.email.toLowerCase().trim(), password: await bcrypt.hash(dto.password, 12), rol: 'OPERADOR', sedeId: dto.sedeId }, select: { id: true, nombre: true, email: true, rol: true, sedeId: true, sede: true, activo: true, createdAt: true } });
        await tx.auditLog.create({ data: { userId: actor.id, accion: 'OPERADOR_CREADO', entidad: 'User', entidadId: created.id, detalle: { email: created.email, sedeId: created.sedeId } } });
        return created;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new BadRequestException('El correo ya está registrado');
      throw error;
    }
  }

  async updateOperador(id: string, dto: UpdateOperadorDto, actor: AuthenticatedUser) {
    const current = await this.prisma.user.findFirst({ where: { id, rol: 'OPERADOR', deletedAt: null } });
    if (!current) throw new NotFoundException('Operador no encontrado');
    if (dto.sedeId) {
      const sede = await this.prisma.sede.findUnique({ where: { id: dto.sedeId } });
      if (!sede || sede.estado !== 'ACTIVA') throw new BadRequestException('La sede seleccionada no está disponible');
    }
    return this.prisma.$transaction(async tx => {
      const updated = await tx.user.update({ where: { id }, data: { nombre: dto.nombre?.trim(), sedeId: dto.sedeId, activo: dto.activo, ...(dto.activo === false ? { tokenVersion: { increment: 1 } } : {}) }, select: { id: true, nombre: true, email: true, rol: true, sedeId: true, sede: true, activo: true, ultimoLogin: true, createdAt: true } });
      await tx.auditLog.create({ data: { userId: actor.id, accion: 'OPERADOR_ACTUALIZADO', entidad: 'User', entidadId: id, detalle: { activoAnterior: current.activo, activoNuevo: updated.activo, sedeAnterior: current.sedeId, sedeNueva: updated.sedeId } } });
      return updated;
    });
  }

  async audit(filters: AuditFilterDto) {
    const page = Math.max(Number(filters.page) || 1, 1); const limit = Math.min(Math.max(Number(filters.limit) || 20, 1), 100);
    const where = filters.entidad ? { entidad: filters.entidad } : undefined;
    const [data,total] = await Promise.all([
      this.prisma.auditLog.findMany({ where, include: { user: { select: { nombre: true, email: true } } }, orderBy: { createdAt: 'desc' }, skip: (page-1)*limit, take: limit }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total/limit) } };
  }
}
