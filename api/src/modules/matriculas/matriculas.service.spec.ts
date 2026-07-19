import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { MatriculasService } from './matriculas.service';

const operator = { id: 'user-1', email: 'coord@example.test', nombre: 'Coordinador', rol: 'OPERADOR' as const, sedeId: 'sede-1' };
const dto = { estudianteId: 'student-1', programaId: 'program-1', sedeId: 'sede-1', periodo: '2026-2' };

describe('MatriculasService', () => {
  const prisma = {
    estudiante: { findUnique: jest.fn() },
    programa: { findUnique: jest.fn() },
    sede: { findUnique: jest.fn() },
    matricula: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    auditLog: { create: jest.fn() },
  };
  const service = new MatriculasService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('impide que un coordinador matricule en otra sede', async () => {
    await expect(service.create({ ...dto, sedeId: 'sede-2' }, operator)).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.matricula.create).not.toHaveBeenCalled();
  });

  it('impide matricular un estudiante inactivo', async () => {
    prisma.estudiante.findUnique.mockResolvedValue({ id: 'student-1', sedeId: 'sede-1', estado: 'INACTIVO', deletedAt: null });
    prisma.programa.findUnique.mockResolvedValue({ id: 'program-1', estado: 'ACTIVO' });
    prisma.sede.findUnique.mockResolvedValue({ id: 'sede-1', estado: 'ACTIVA' });
    await expect(service.create(dto, operator)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('crea matrícula válida y registra auditoría', async () => {
    prisma.estudiante.findUnique.mockResolvedValue({ id: 'student-1', sedeId: 'sede-1', estado: 'ACTIVO', deletedAt: null });
    prisma.programa.findUnique.mockResolvedValue({ id: 'program-1', estado: 'ACTIVO' });
    prisma.sede.findUnique.mockResolvedValue({ id: 'sede-1', estado: 'ACTIVA' });
    prisma.matricula.create.mockResolvedValue({ id: 'enrollment-1' });
    await expect(service.create(dto, operator)).resolves.toEqual({ id: 'enrollment-1' });
    expect(prisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ accion: 'MATRICULA_CREADA' }) }));
  });
});
