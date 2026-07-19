# DNA Music - Plataforma de Gestión Académica Multisede

Aplicación institucional para gestionar estudiantes, programas de formación musical y matrículas por sede y periodo. El repositorio separa `api/` (NestJS, Prisma y PostgreSQL) de `web/` (React y Vite).

## Demo publica

El usuario final usa una sola URL publica:

- Demo principal: `https://dna-music-web.vercel.app`
- Verificación de API vía frontend: `https://dna-music-web.vercel.app/api/health`
- Backend de infraestructura: `https://academic-management-api-35mu.onrender.com`
- Health directo: `https://academic-management-api-35mu.onrender.com/api/health`

Vercel sirve el frontend y proxyea internamente `/api/*` hacia Render. Por eso el boton publico del demo debe apuntar al frontend, no al backend directo.

## Estructura

```text
api/                 Backend NestJS + TypeScript
  src/
  prisma/              Esquema, migraciones y datos ficticios
  package.json
  tsconfig.json
web/                 Frontend React + Vite
  src/                 Resumen, estudiantes, programas y matrículas
  package.json
  tsconfig.json
  vercel.json
analisis_tecnico.md  Respuesta seccion 6
git_respuestas.md    Respuesta seccion 7
seguridad_revision.md Revision de seguridad y autorizacion
README.md            Documentacion principal
```

## Ejecucion local

Requisitos:

- Node.js 20 o superior.
- npm 10 o superior.
- PostgreSQL local o Docker.

Levantar PostgreSQL con Docker:

```bash
docker compose up -d db
```

Backend:

```bash
cd api
npm install
copy .env.example .env
npm run prisma:generate
npm run db:push
npm run db:seed
npm run start:dev
```

En producción, `npm run start:prod` ejecuta las migraciones antes de iniciar NestJS. Si detecta una base histórica sin tabla de migraciones (`P3005`), registra el baseline existente sin borrar datos y continúa con las migraciones complementarias.

Frontend:

```bash
cd web
npm install
copy .env.example .env
npm run dev
```

URLs locales:

- API: `http://localhost:3000/api`
- Health check: `http://localhost:3000/api/health`
- Frontend: `http://localhost:3001`

En desarrollo, Vite proxyea `/api` hacia `http://localhost:3000`. En produccion, Vercel proxyea `/api/*` hacia Render.

## Variables de entorno

Backend Render:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=valor-largo-y-seguro
JWT_EXPIRATION=1h
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://dna-music-web.vercel.app
DEMO_MODE=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Frontend Vercel:

```env
VITE_API_URL=
VITE_DEMO_MODE=true
```

`VITE_API_URL` debe quedar vacia o eliminada para usar same-origin. Las llamadas del frontend quedan como `/api/auth/login`, `/api/estudiantes` y `/api/health`.

## Credenciales de prueba

El seed crea usuarios de demo con dominios reservados:

- ADMIN: `admin@example.test` / `DemoAdmin123!`
- OPERADOR BOGOTA: `operador.bogota@example.test` / `DemoOper123!`
- OPERADOR MEDELLIN: `operador.medellin@example.test` / `DemoOper123!`

Tambien crea 3 sedes activas y 18 estudiantes distribuidos entre Bogota, Medellin y Cali, con estados `ACTIVO`, `INACTIVO` y `RETIRADO`.

Estas credenciales son de demo. No deben reutilizarse como credenciales reales de produccion.

## Modo demo publico

Con `DEMO_MODE=true`, el backend bloquea `DELETE /api/estudiantes/:id` y responde:

```json
{
  "message": "Operacion deshabilitada en demo publica"
}
```

En modo demo se mantiene permitido:

- login
- listar y filtrar estudiantes
- crear estudiantes
- editar estudiantes
- suspender estudiantes

El frontend usa `VITE_DEMO_MODE=true` para mostrar un aviso discreto y deshabilitar la accion de eliminar. Esta limitacion es solo de experiencia de usuario; la regla real vive en el backend.

## Decisiones tecnicas

- Backend con NestJS por su estructura modular, guards, pipes de validacion y separacion entre controladores, servicios y modulos.
- Prisma como ORM para tipado fuerte, modelo declarativo y consultas agregadas.
- PostgreSQL como base principal.
- Frontend con React + Vite, login, listado, filtros, paginacion, formularios y acciones administrativas.
- Autorizacion real en backend. El frontend solo oculta o deshabilita acciones para mejorar UX.
- URL publica unica mediante proxy de Vercel sobre `/api/*`.
- Soft delete para estudiantes mediante `deletedAt`, evitando eliminacion fisica accidental.
- Suspension profesional de estudiantes mediante estado `INACTIVO`, manteniendo el registro visible para auditoria.

## Seguridad y autorizacion

Implementado:

- Passwords hasheados con bcrypt y salt.
- JWT firmado con `JWT_SECRET` y expiracion configurable.
- Guards para rutas autenticadas y rutas exclusivas de ADMIN.
- `POST /api/auth/register`, CRUD de sedes y estadisticas protegidos para ADMIN.
- `PUT /api/estudiantes/:id`, `PATCH /api/estudiantes/:id/suspender`, `PATCH /api/estudiantes/:id/desactivar` y `DELETE /api/estudiantes/:id` protegidos para ADMIN.
- OPERADOR no ve columna `Acciones` en frontend y tampoco puede editar, suspender, desactivar o eliminar estudiantes por API.
- OPERADOR solo lista, consulta y crea estudiantes en su propia sede.
- ADMIN puede ver todas las sedes y estudiantes.
- Bloqueo temporal tras 5 intentos fallidos.
- Helmet, CORS configurable y rate limiting global bajo `/api`.
- `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y transformacion de tipos.
- Variables sensibles por `.env`; `.env` esta ignorado por Git.

Pendiente con mas tiempo:

- Refresh tokens con rotacion y revocacion.
- Cookies `httpOnly`, `secure` y `sameSite` en vez de `localStorage` para el token del frontend.
- Rate limit especifico por email/IP en `/auth/login`.
- Auditoria de cambios por usuario.
- Logs estructurados con request id.
- Tests automatizados de guards y permisos por rol.

Mas detalle en `seguridad_revision.md`.

## Alcance funcional

- Resumen operativo con actividad reciente e indicadores.
- Estudiantes con búsqueda, filtros, estados y control por sede.
- Catálogo formal de programas con código, duración y modalidad.
- Matrículas únicas por estudiante, programa y periodo.
- Autorización para administración general y coordinación de sede.
- Auditoría básica de creación y cambio de estado de matrículas.
- Diseño institucional responsive sin módulos simulados.

## Modelo de datos

```text
Sede
- id
- nombre
- ciudad
- direccion
- estado
- createdAt / updatedAt

User
- id
- email
- nombre
- password
- rol: ADMIN | OPERADOR
- sedeId -> Sede.id opcional
- activo
- intentosFallo
- bloqueadoHasta
- ultimoLogin
- deletedAt
- createdAt / updatedAt

Estudiante
- id
- nombreCompleto
- email
- telefono
- documento
- sedeId -> Sede.id
- programa
- estado: ACTIVO | INACTIVO | RETIRADO
- fechaInscripcion
- deletedAt
- createdAt / updatedAt

Programa
- código y nombre únicos
- descripción, duración y modalidad
- estado activo/inactivo

Matrícula
- estudiante, programa y sede
- periodo y estado académico
- fecha de matrícula

AuditLog
- usuario responsable
- acción, entidad y detalle del cambio
```

Relaciones:

- Una sede tiene muchos usuarios.
- Una sede tiene muchos estudiantes.
- Un estudiante pertenece a una sede.

## Endpoints principales

Auth:

- `POST /api/auth/login`
- `POST /api/auth/register` - solo ADMIN
- `POST /api/auth/verify`

Sedes:

- `GET /api/sedes`
- `GET /api/sedes/:id`
- `POST /api/sedes` - solo ADMIN
- `PUT /api/sedes/:id` - solo ADMIN
- `DELETE /api/sedes/:id` - solo ADMIN

Estudiantes:

- `GET /api/estudiantes`
- `GET /api/estudiantes/:id`
- `POST /api/estudiantes` - autenticado; OPERADOR solo en su sede
- `PUT /api/estudiantes/:id` - solo ADMIN
- `PATCH /api/estudiantes/:id/suspender` - solo ADMIN, cambia `estado` a `INACTIVO`
- `PATCH /api/estudiantes/:id/desactivar` - solo ADMIN, endpoint compatible heredado
- `DELETE /api/estudiantes/:id` - solo ADMIN, soft delete; bloqueado con `DEMO_MODE=true`

Estadisticas:

- `GET /api/stats` - solo ADMIN

Health:

- `GET /api/health`

## Comandos de validacion

Backend:

```bash
cd api
npm install
npm run build
```

Frontend:

```bash
cd web
npm install
npm run build
```

## Verificar suspension de estudiante

Ejemplo PowerShell contra la URL unica del frontend:

```powershell
$API_URL = "https://academic-management-web.vercel.app"

$login = Invoke-RestMethod `
  -Method POST `
  -Uri "$API_URL/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"admin@example.test","password":"DemoAdmin123!"}'

$token = $login.access_token
$id = "ID_DEL_ESTUDIANTE"

Invoke-RestMethod `
  -Method PATCH `
  -Uri "$API_URL/api/estudiantes/$id/suspender" `
  -Headers @{ Authorization = "Bearer $token" }

$estudiantes = Invoke-RestMethod `
  -Method GET `
  -Uri "$API_URL/api/estudiantes" `
  -Headers @{ Authorization = "Bearer $token" }

$estudiantes.data | Where-Object { $_.id -eq $id }
```

Resultado esperado: el estudiante queda con `estado: INACTIVO`. La suspension conserva el registro y permite auditoria.
