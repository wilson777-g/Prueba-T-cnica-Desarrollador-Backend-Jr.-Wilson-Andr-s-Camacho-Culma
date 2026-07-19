import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../../types/authenticated-user';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStats(user: AuthenticatedUser) {
    if (user.rol !== 'ADMIN') {
      throw new ForbiddenException('Solo administradores pueden ver estadisticas');
    }

    const [
      estudiantesPorSede,
      estudiantesPorEstado,
      sedeActivaMasPoblada,
      totalEstudiantes,
      totalSedes,
      totalUsuarios,
      matriculasPorEstado,
      programasActivos,
      actividadReciente,
    ] = await Promise.all([
      this.prisma.sede.findMany({
        select: {
          id: true,
          nombre: true,
          ciudad: true,
          _count: {
            select: {
              estudiantes: {
                where: { deletedAt: null },
              },
            },
          },
        },
        orderBy: {
          nombre: 'asc',
        },
      }),
      this.prisma.estudiante.groupBy({
        by: ['estado'],
        _count: {
          id: true,
        },
        where: {
          deletedAt: null,
        },
      }),
      this.prisma.estudiante.groupBy({
        by: ['sedeId'],
        _count: {
          id: true,
        },
        where: {
          estado: 'ACTIVO',
          deletedAt: null,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 1,
      }),
      this.prisma.estudiante.count({
        where: { deletedAt: null },
      }),
      this.prisma.sede.count({
        where: { estado: 'ACTIVA' },
      }),
      this.prisma.user.count({
        where: { activo: true, deletedAt: null },
      }),
      this.prisma.matricula.groupBy({ by: ['estado'], _count: { id: true } }),
      this.prisma.programa.count({ where: { estado: 'ACTIVO' } }),
      this.prisma.auditLog.findMany({ include: { user: { select: { nombre: true } } }, orderBy: { createdAt: 'desc' }, take: 8 }),
    ]);

    const sedeConMasActivos = sedeActivaMasPoblada[0]
      ? await this.prisma.sede.findUnique({
          where: { id: sedeActivaMasPoblada[0].sedeId },
          select: {
            id: true,
            nombre: true,
            ciudad: true,
          },
        })
      : null;

    return {
      resumen: {
        totalEstudiantes,
        totalSedes,
        totalUsuarios,
        programasActivos,
        totalMatriculas: matriculasPorEstado.reduce((total, item) => total + item._count.id, 0),
      },
      estudiantesPorSede: estudiantesPorSede.map(sede => ({
        sedeId: sede.id,
        sedeName: sede.nombre,
        ciudad: sede.ciudad,
        cantidad: sede._count.estudiantes,
      })),
      estudiantesPorEstado: estudiantesPorEstado.reduce((acc, item) => {
        acc[item.estado] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      matriculasPorEstado: matriculasPorEstado.reduce((acc, item) => {
        acc[item.estado] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      actividadReciente,
      sedeConMasEstudiantesActivos:
        sedeConMasActivos && sedeActivaMasPoblada[0]
          ? {
              sedeId: sedeConMasActivos.id,
              sedeName: sedeConMasActivos.nombre,
              ciudad: sedeConMasActivos.ciudad,
              estudiantesActivos: sedeActivaMasPoblada[0]._count.id,
            }
          : null,
      timestamp: new Date().toISOString(),
    };
  }
}
