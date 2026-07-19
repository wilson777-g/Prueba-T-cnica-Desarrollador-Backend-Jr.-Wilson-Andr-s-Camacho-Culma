DO $$ BEGIN CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERADOR'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "SedeEstado" AS ENUM ('ACTIVA', 'INACTIVA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EstudianteEstado" AS ENUM ('ACTIVO', 'INACTIVO', 'RETIRADO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "Sede" (
  "id" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "ciudad" TEXT NOT NULL,
  "direccion" TEXT NOT NULL,
  "estado" "SedeEstado" NOT NULL DEFAULT 'ACTIVA',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Sede_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "rol" "UserRole" NOT NULL DEFAULT 'OPERADOR',
  "sedeId" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "ultimoLogin" TIMESTAMP(3),
  "intentosFallo" INTEGER NOT NULL DEFAULT 0,
  "bloqueadoHasta" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Estudiante" (
  "id" TEXT NOT NULL,
  "nombreCompleto" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "telefono" TEXT NOT NULL,
  "documento" TEXT NOT NULL,
  "sedeId" TEXT NOT NULL,
  "programa" TEXT NOT NULL,
  "estado" "EstudianteEstado" NOT NULL DEFAULT 'ACTIVO',
  "fechaInscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Estudiante_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Sede_nombre_key" ON "Sede"("nombre");
CREATE INDEX IF NOT EXISTS "Sede_ciudad_idx" ON "Sede"("ciudad");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_sedeId_idx" ON "User"("sedeId");
CREATE UNIQUE INDEX IF NOT EXISTS "Estudiante_email_key" ON "Estudiante"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Estudiante_documento_key" ON "Estudiante"("documento");
CREATE INDEX IF NOT EXISTS "Estudiante_sedeId_idx" ON "Estudiante"("sedeId");
CREATE INDEX IF NOT EXISTS "Estudiante_estado_idx" ON "Estudiante"("estado");
CREATE INDEX IF NOT EXISTS "Estudiante_email_idx" ON "Estudiante"("email");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_sedeId_fkey') THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Estudiante_sedeId_fkey') THEN
    ALTER TABLE "Estudiante" ADD CONSTRAINT "Estudiante_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
