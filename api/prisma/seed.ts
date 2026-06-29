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

  const adminPassword = await bcrypt.hash('DemoAdmin123!', 10);
  const operadorPassword = await bcrypt.hash('DemoOper123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.test' },
    update: {
      nombre: 'Administrador del Sistema',
      password: adminPassword,
      rol: 'ADMIN',
      sedeId: null,
      activo: true,
      deletedAt: null,
    },
    create: {
      email: 'admin@example.test',
      nombre: 'Administrador del Sistema',
      password: adminPassword,
      rol: 'ADMIN',
      activo: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'operador.bogota@example.test' },
    update: {
      nombre: 'Operador Bogota',
      password: operadorPassword,
      rol: 'OPERADOR',
      sedeId: bogota.id,
      activo: true,
      deletedAt: null,
    },
    create: {
      email: 'operador.bogota@example.test',
      nombre: 'Operador Bogota',
      password: operadorPassword,
      rol: 'OPERADOR',
      sedeId: bogota.id,
      activo: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'operador.medellin@example.test' },
    update: {
      nombre: 'Operador Medellin',
      password: operadorPassword,
      rol: 'OPERADOR',
      sedeId: medellin.id,
      activo: true,
      deletedAt: null,
    },
    create: {
      email: 'operador.medellin@example.test',
      nombre: 'Operador Medellin',
      password: operadorPassword,
      rol: 'OPERADOR',
      sedeId: medellin.id,
      activo: true,
    },
  });

  const estudiantes = [
    {
      nombreCompleto: 'Juan Carlos Rojas',
      email: 'juan.rojas.bogota@example.com',
      telefono: '3001001001',
      documento: '2001001001',
      programa: 'Canto',
      sedeId: bogota.id,
      estado: 'ACTIVO' as const,
    },
    {
      nombreCompleto: 'Maria Camila Garcia',
      email: 'maria.garcia.bogota@example.com',
      telefono: '3001001002',
      documento: '2001001002',
      programa: 'Piano',
      sedeId: bogota.id,
      estado: 'ACTIVO' as const,
    },
    {
      nombreCompleto: 'Sofia Morales Castro',
      email: 'sofia.morales.bogota@example.com',
      telefono: '3001001003',
      documento: '2001001003',
      programa: 'Danza',
      sedeId: bogota.id,
      estado: 'INACTIVO' as const,
    },
    {
      nombreCompleto: 'Andres Felipe Torres',
      email: 'andres.torres.bogota@example.com',
      telefono: '3001001004',
      documento: '2001001004',
      programa: 'Produccion Musical',
      sedeId: bogota.id,
      estado: 'RETIRADO' as const,
    },
    {
      nombreCompleto: 'Daniela Paez Medina',
      email: 'daniela.paez.bogota@example.com',
      telefono: '3001001005',
      documento: '2001001005',
      programa: 'Tecnica Vocal',
      sedeId: bogota.id,
      estado: 'ACTIVO' as const,
    },
    {
      nombreCompleto: 'Miguel Angel Ruiz',
      email: 'miguel.ruiz.bogota@example.com',
      telefono: '3001001006',
      documento: '2001001006',
      programa: 'Bateria',
      sedeId: bogota.id,
      estado: 'INACTIVO' as const,
    },
    {
      nombreCompleto: 'Carlos Perez Morales',
      email: 'carlos.perez.medellin@example.com',
      telefono: '3102002001',
      documento: '2102002001',
      programa: 'Guitarra',
      sedeId: medellin.id,
      estado: 'ACTIVO' as const,
    },
    {
      nombreCompleto: 'Laura Martinez Flores',
      email: 'laura.martinez.medellin@example.com',
      telefono: '3102002002',
      documento: '2102002002',
      programa: 'Violin',
      sedeId: medellin.id,
      estado: 'INACTIVO' as const,
    },
    {
      nombreCompleto: 'Valentina Restrepo Arias',
      email: 'valentina.restrepo.medellin@example.com',
      telefono: '3102002003',
      documento: '2102002003',
      programa: 'Bajo',
      sedeId: medellin.id,
      estado: 'ACTIVO' as const,
    },
    {
      nombreCompleto: 'Samuel Hernandez Soto',
      email: 'samuel.hernandez.medellin@example.com',
      telefono: '3102002004',
      documento: '2102002004',
      programa: 'Composicion',
      sedeId: medellin.id,
      estado: 'RETIRADO' as const,
    },
    {
      nombreCompleto: 'Isabella Quintero Lopez',
      email: 'isabella.quintero.medellin@example.com',
      telefono: '3102002005',
      documento: '2102002005',
      programa: 'Canto',
      sedeId: medellin.id,
      estado: 'ACTIVO' as const,
    },
    {
      nombreCompleto: 'Mateo Alvarez Gomez',
      email: 'mateo.alvarez.medellin@example.com',
      telefono: '3102002006',
      documento: '2102002006',
      programa: 'Piano',
      sedeId: medellin.id,
      estado: 'INACTIVO' as const,
    },
    {
      nombreCompleto: 'Diego Sanchez Hernandez',
      email: 'diego.sanchez.cali@example.com',
      telefono: '3153003001',
      documento: '2203003001',
      programa: 'Composicion',
      sedeId: cali.id,
      estado: 'ACTIVO' as const,
    },
    {
      nombreCompleto: 'Ana Torres Silva',
      email: 'ana.torres.cali@example.com',
      telefono: '3153003002',
      documento: '2203003002',
      programa: 'Danza',
      sedeId: cali.id,
      estado: 'RETIRADO' as const,
    },
    {
      nombreCompleto: 'Nicolas Romero Diaz',
      email: 'nicolas.romero.cali@example.com',
      telefono: '3153003003',
      documento: '2203003003',
      programa: 'Guitarra',
      sedeId: cali.id,
      estado: 'ACTIVO' as const,
    },
    {
      nombreCompleto: 'Camila Navarro Rios',
      email: 'camila.navarro.cali@example.com',
      telefono: '3153003004',
      documento: '2203003004',
      programa: 'Tecnica Vocal',
      sedeId: cali.id,
      estado: 'INACTIVO' as const,
    },
    {
      nombreCompleto: 'Julian Ortega Casas',
      email: 'julian.ortega.cali@example.com',
      telefono: '3153003005',
      documento: '2203003005',
      programa: 'Bateria',
      sedeId: cali.id,
      estado: 'ACTIVO' as const,
    },
    {
      nombreCompleto: 'Luciana Vargas Pineda',
      email: 'luciana.vargas.cali@example.com',
      telefono: '3153003006',
      documento: '2203003006',
      programa: 'Produccion Musical',
      sedeId: cali.id,
      estado: 'INACTIVO' as const,
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
  console.log('ADMIN: admin@example.test / DemoAdmin123!');
  console.log('OPERADOR BOGOTA: operador.bogota@example.test / DemoOper123!');
  console.log('OPERADOR MEDELLIN: operador.medellin@example.test / DemoOper123!');
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
