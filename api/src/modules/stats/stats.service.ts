import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Endpoint de estadísticas
   * Solo ADMIN puede acceder
   * Usa queries agregadas de Prisma para mejor performance
   */
  async getStats(user: any) {
    if (user.rol !== 'ADMIN') {
      throw new ForbiddenException('Solo administradores pueden ver estadísticas');
    }

    // Query 1: Total de estudiantes por sede
    const estudiantesPorSede = await this.prisma.sede.findMany({
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
    });

    // Query 2: Total de estudiantes por estado
    const estudiantesPorEstado = await this.prisma.estudiante.groupBy({
      by: ['estado'],
      _count: {
        id: true,
      },
      where: {
        deletedAt: null,
      },
    });

    // Query 3: Sede con más estudiantes activos
    const sedeConMasEstudiantesActivos = await this.prisma.sede.findFirst({
      select: {
        id: true,
        nombre: true,
        ciudad: true,
        _count: {
          select: {
            estudiantes: {
              where: {
                estado: 'ACTIVO',
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        estudiantes: {
          _count: 'desc',
        },
      },
    });

    // Query 4: Estadísticas generales
    const totalEstudiantes = await this.prisma.estudiante.count({
      where: { deletedAt: null },
    });

    const totalSedes = await this.prisma.sede.count({
      where: { estado: 'ACTIVA' },
    });

    const totalUsuarios = await this.prisma.user.count({
      where: { activo: true },
    });

    return {
      resumen: {
        totalEstudiantes,
        totalSedes,
        totalUsuarios,
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
      sedeConMasEstudiantesActivos: sedeConMasEstudiantesActivos
        ? {
            sedeId: sedeConMasEstudiantesActivos.id,
            sedeName: sedeConMasEstudiantesActivos.nombre,
            ciudad: sedeConMasEstudiantesActivos.ciudad,
            estudiantesActivos: sedeConMasEstudiantesActivos._count.estudiantes,
          }
        : null,
      timestamp: new Date().toISOString(),
    };
  }
}
