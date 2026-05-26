import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  const bogota = await prisma.sede.upsert({
    where: { nombre: 'Bogota' },
    update: {
      ciudad: 'Bogota',
      direccion: 'Cra 7 #100-50, Bogota',
      estado: 'ACTIVA',
    },
    create: {
      nombre: 'Bogota',
      ciudad: 'Bogota',
      direccion: 'Cra 7 #100-50, Bogota',
      estado: 'ACTIVA',
    },
  });

  const medellin = await prisma.sede.upsert({
    where: { nombre: 'Medellin' },
    update: {
      ciudad: 'Medellin',
      direccion: 'Cra 45 #50-100, Medellin',
      estado: 'ACTIVA',
    },
    create: {
      nombre: 'Medellin',
      ciudad: 'Medellin',
      direccion: 'Cra 45 #50-100, Medellin',
      estado: 'ACTIVA',
    },
  });

  const cali = await prisma.sede.upsert({
    where: { nombre: 'Cali' },
    update: {
      ciudad: 'Cali',
      direccion: 'Cra 5 #60-30, Cali',
      estado: 'ACTIVA',
    },
    create: {
      nombre: 'Cali',
      ciudad: 'Cali',
      direccion: 'Cra 5 #60-30, Cali',
      estado: 'ACTIVA',
    },
  });

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const operadorPassword = await bcrypt.hash('Oper123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@dnamusic.co' },
    update: {
      nombre: 'Administrador DNA Music',
      password: adminPassword,
      rol: 'ADMIN',
      sedeId: null,
      activo: true,
      deletedAt: null,
    },
    create: {
      email: 'admin@dnamusic.co',
      nombre: 'Administrador DNA Music',
      password: adminPassword,
      rol: 'ADMIN',
      activo: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'operador.bog@dnamusic.co' },
    update: {
      nombre: 'Operador Bogota',
      password: operadorPassword,
      rol: 'OPERADOR',
      sedeId: bogota.id,
      activo: true,
      deletedAt: null,
    },
    create: {
      email: 'operador.bog@dnamusic.co',
      nombre: 'Operador Bogota',
      password: operadorPassword,
      rol: 'OPERADOR',
      sedeId: bogota.id,
      activo: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'operador.med@dnamusic.co' },
    update: {
      nombre: 'Operador Medellin',
      password: operadorPassword,
      rol: 'OPERADOR',
      sedeId: medellin.id,
      activo: true,
      deletedAt: null,
    },
    create: {
      email: 'operador.med@dnamusic.co',
      nombre: 'Operador Medellin',
      password: operadorPassword,
      rol: 'OPERADOR',
      sedeId: medellin.id,
      activo: true,
    },
  });

  const estudiantes = [
    {
      nombreCompleto: 'Juan Carlos Rodriguez',
      email: 'juan.rodriguez@example.com',
      telefono: '3001234567',
      documento: '1001234567',
      programa: 'Canto',
      sedeId: bogota.id,
      estado: 'ACTIVO' as const,
    },
    {
      nombreCompleto: 'Maria Garcia Lopez',
      email: 'maria.garcia@example.com',
      telefono: '3107654321',
      documento: '1007654321',
      programa: 'Piano',
      sedeId: bogota.id,
      estado: 'ACTIVO' as const,
    },
    {
      nombreCompleto: 'Carlos Perez Morales',
      email: 'carlos.perez@example.com',
      telefono: '3112345678',
      documento: '1112345678',
      programa: 'Guitarra',
      sedeId: medellin.id,
      estado: 'ACTIVO' as const,
    },
    {
      nombreCompleto: 'Laura Martinez Flores',
      email: 'laura.martinez@example.com',
      telefono: '3119876543',
      documento: '1119876543',
      programa: 'Violin',
      sedeId: medellin.id,
      estado: 'INACTIVO' as const,
    },
    {
      nombreCompleto: 'Diego Sanchez Hernandez',
      email: 'diego.sanchez@example.com',
      telefono: '3154567890',
      documento: '1154567890',
      programa: 'Composicion',
      sedeId: cali.id,
      estado: 'ACTIVO' as const,
    },
    {
      nombreCompleto: 'Ana Torres Silva',
      email: 'ana.torres@example.com',
      telefono: '3165432109',
      documento: '1165432109',
      programa: 'Danza',
      sedeId: bogota.id,
      estado: 'RETIRADO' as const,
    },
  ];

  for (const estudiante of estudiantes) {
    await prisma.estudiante.upsert({
      where: { email: estudiante.email },
      update: {
        ...estudiante,
        deletedAt: null,
      },
      create: estudiante,
    });
  }

  console.log('Seed completado.');
  console.log('Credenciales:');
  console.log('ADMIN: admin@dnamusic.co / Admin123!');
  console.log('OPERADOR BOG: operador.bog@dnamusic.co / Oper123!');
  console.log('OPERADOR MED: operador.med@dnamusic.co / Oper123!');
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
