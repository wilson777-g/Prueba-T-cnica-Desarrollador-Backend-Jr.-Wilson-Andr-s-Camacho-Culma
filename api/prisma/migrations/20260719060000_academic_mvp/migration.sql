CREATE TYPE "ProgramaModalidad" AS ENUM ('PRESENCIAL', 'HIBRIDA', 'VIRTUAL');
CREATE TYPE "ProgramaEstado" AS ENUM ('ACTIVO', 'INACTIVO');
CREATE TYPE "MatriculaEstado" AS ENUM ('ACTIVA', 'FINALIZADA', 'CANCELADA');

CREATE TABLE "Programa" (
  "id" TEXT NOT NULL,
  "codigo" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "duracionMeses" INTEGER NOT NULL,
  "modalidad" "ProgramaModalidad" NOT NULL DEFAULT 'PRESENCIAL',
  "estado" "ProgramaEstado" NOT NULL DEFAULT 'ACTIVO',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Programa_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Matricula" (
  "id" TEXT NOT NULL,
  "estudianteId" TEXT NOT NULL,
  "programaId" TEXT NOT NULL,
  "sedeId" TEXT NOT NULL,
  "periodo" TEXT NOT NULL,
  "estado" "MatriculaEstado" NOT NULL DEFAULT 'ACTIVA',
  "fechaMatricula" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Matricula_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accion" TEXT NOT NULL,
  "entidad" TEXT NOT NULL,
  "entidadId" TEXT NOT NULL,
  "detalle" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Programa_codigo_key" ON "Programa"("codigo");
CREATE UNIQUE INDEX "Programa_nombre_key" ON "Programa"("nombre");
CREATE INDEX "Programa_estado_idx" ON "Programa"("estado");
CREATE UNIQUE INDEX "Matricula_estudianteId_programaId_periodo_key" ON "Matricula"("estudianteId", "programaId", "periodo");
CREATE INDEX "Matricula_sedeId_periodo_idx" ON "Matricula"("sedeId", "periodo");
CREATE INDEX "Matricula_estado_idx" ON "Matricula"("estado");
CREATE INDEX "AuditLog_entidad_entidadId_idx" ON "AuditLog"("entidad", "entidadId");
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_programaId_fkey" FOREIGN KEY ("programaId") REFERENCES "Programa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "Programa" ("id", "codigo", "nombre", "descripcion", "duracionMeses", "modalidad", "estado", "createdAt", "updatedAt") VALUES
('programa-canto', 'MUS-CAN', 'Canto contemporáneo', 'Técnica vocal, interpretación y ensamble.', 12, 'PRESENCIAL', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('programa-piano', 'MUS-PIA', 'Piano integral', 'Lectura, armonía y repertorio aplicado.', 18, 'PRESENCIAL', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('programa-guitarra', 'MUS-GUI', 'Guitarra moderna', 'Técnica, acompañamiento y práctica de ensamble.', 12, 'HIBRIDA', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('programa-produccion', 'MUS-PRO', 'Producción musical', 'Grabación, edición, mezcla y fundamentos de audio.', 10, 'HIBRIDA', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("codigo") DO NOTHING;

INSERT INTO "Matricula" ("id", "estudianteId", "programaId", "sedeId", "periodo", "estado", "fechaMatricula", "createdAt", "updatedAt")
SELECT 'matricula-juan-canto', e."id", p."id", e."sedeId", '2026-2', 'ACTIVA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Estudiante" e CROSS JOIN "Programa" p
WHERE e."email" = 'juan.rojas.bogota@example.com' AND p."codigo" = 'MUS-CAN'
ON CONFLICT ("estudianteId", "programaId", "periodo") DO NOTHING;

INSERT INTO "Matricula" ("id", "estudianteId", "programaId", "sedeId", "periodo", "estado", "fechaMatricula", "createdAt", "updatedAt")
SELECT 'matricula-maria-piano', e."id", p."id", e."sedeId", '2026-2', 'ACTIVA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Estudiante" e CROSS JOIN "Programa" p
WHERE e."email" = 'maria.garcia.bogota@example.com' AND p."codigo" = 'MUS-PIA'
ON CONFLICT ("estudianteId", "programaId", "periodo") DO NOTHING;
