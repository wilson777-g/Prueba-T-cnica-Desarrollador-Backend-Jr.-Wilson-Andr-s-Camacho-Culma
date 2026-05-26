import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ============================================
  // 1. CREAR SEDES
  // ============================================
  const bogota = await prisma.sede.upsert({
    where: { nombre: 'Bogotá' },
    update: {},
    create: {
      nombre: 'Bogotá',
      ciudad: 'Bogotá',
      direccion: 'Cra 7 #100-50, Bogotá',
      estado: 'ACTIVA',
    },
  });

  const medellin = await prisma.sede.upsert({
    where: { nombre: 'Medellín' },
    update: {},
    create: {
      nombre: 'Medellín',
      ciudad: 'Medellín',
      direccion: 'Cra 45 #50-100, Medellín',
      estado: 'ACTIVA',
    },
  });

  const cali = await prisma.sede.upsert({
    where: { nombre: 'Cali' },
    update: {},
    create: {
      nombre: 'Cali',
      ciudad: 'Cali',
      direccion: 'Cra 5 #60-30, Cali',
      estado: 'ACTIVA',
    },
  });

  console.log('✅ Sedes creadas');

  // ============================================
  // 2. CREAR USUARIOS (ADMIN + OPERADORES)
  // ============================================
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const operadorPassword = await bcrypt.hash('Oper123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dnamusic.co' },
    update: {},
    create: {
      email: 'admin@dnamusic.co',
      nombre: 'Administrador DNA Music',
      password: adminPassword,
      rol: 'ADMIN',
      activo: true,
    },
  });

  const operadorBog = await prisma.user.upsert({
    where: { email: 'operador.bog@dnamusic.co' },
    update: {},
    create: {
      email: 'operador.bog@dnamusic.co',
      nombre: 'Operador Bogotá',
      password: operadorPassword,
      rol: 'OPERADOR',
      sedeId: bogota.id,
      activo: true,
    },
  });

  const operadorMed = await prisma.user.upsert({
    where: { email: 'operador.med@dnamusic.co' },
    update: {},
    create: {
      email: 'operador.med@dnamusic.co',
      nombre: 'Operador Medellín',
      password: operadorPassword,
      rol: 'OPERADOR',
      sedeId: medellin.id,
      activo: true,
    },
  });

  console.log('✅ Usuarios creados');

  // ============================================
  // 3. CREAR ESTUDIANTES
  // ============================================
  const estudiantes = [
    {
      nombreCompleto: 'Juan Carlos Rodríguez',
      email: 'juan.rodriguez@example.com',
      telefono: '3001234567',
      documento: '1001234567',
      programa: 'Canto',
      sedeId: bogota.id,
      estado: 'ACTIVO' as const,
    },
    {
      nombreCompleto: 'María García López',
      email: 'maria.garcia@example.com',
      telefono: '3107654321',
      documento: '1007654321',
      programa: 'Piano',
      sedeId: bogota.id,
      estado: 'ACTIVO' as const,
    },
    {
      nombreCompleto: 'Carlos Pérez Morales',
      email: 'carlos.perez@example.com',
      telefono: '3112345678',
      documento: '1112345678',
      programa: 'Guitarra',
      sedeId: medellin.id,
      estado: 'ACTIVO' as const,
    },
    {
      nombreCompleto: 'Laura Martínez Flores',
      email: 'laura.martinez@example.com',
      telefono: '3119876543',
      documento: '1119876543',
      programa: 'Violín',
      sedeId: medellin.id,
      estado: 'INACTIVO' as const,
    },
    {
      nombreCompleto: 'Diego Sánchez Hernández',
      email: 'diego.sanchez@example.com',
      telefono: '3154567890',
      documento: '1154567890',
      programa: 'Composición',
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

  for (const est of estudiantes) {
    await prisma.estudiante.upsert({
      where: { email: est.email },
      update: {},
      create: est,
    });
  }

  console.log('✅ Estudiantes creados');

  console.log('✨ Seed completado exitosamente');
  console.log(`
  📋 Credenciales de prueba:
  
  ADMIN:
  - Email: admin@dnamusic.co
  - Password: Admin123!
  
  OPERADOR (Bogotá):
  - Email: operador.bog@dnamusic.co
  - Password: Oper123!
  
  OPERADOR (Medellín):
  - Email: operador.med@dnamusic.co
  - Password: Oper123!
  `);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
