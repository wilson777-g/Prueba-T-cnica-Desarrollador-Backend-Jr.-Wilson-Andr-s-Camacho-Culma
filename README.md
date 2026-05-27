# DNA Music - Prueba tecnica Backend Jr.

Mini aplicacion para gestion de estudiantes por sede. El repositorio esta separado en `api/` para el backend NestJS y `web/` para el frontend React.

## Estructura

```text
api/                 Backend NestJS + TypeScript
  src/
  prisma/
  package.json
  tsconfig.json
web/                 Frontend React + Vite
  src/
  package.json
  tsconfig.json
analisis_tecnico.md  Respuesta seccion 6
git_respuestas.md    Respuesta seccion 7
seguridad_revision.md Revision de seguridad y autorizacion
README.md            Documentacion principal
```

## 1. Como correr localmente

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

Frontend:

```bash
cd web
npm install
copy .env.example .env
npm run dev
```

URLs locales:

- API: `http://localhost:3000/api`
- Frontend: `http://localhost:3001`

Nota: el `docker-compose.yml` publica PostgreSQL en el puerto local `5433` para evitar choques con instalaciones locales de PostgreSQL en `5432`.

## 2. URLs de despliegue

- Backend Render: https://dna-music-api-j323.onrender.com
- Frontend Vercel: https://dna-music-web.vercel.app

## 3. Credenciales de prueba

El seed crea estos usuarios de demo:

- ADMIN: `admin@dnamusic.co` / `Admin123!`
- OPERADOR BOG: `operador.bog@dnamusic.co` / `Oper123!`
- OPERADOR MED: `operador.med@dnamusic.co` / `Oper123!`

Tambien crea 3 sedes activas y 6 estudiantes distribuidos entre Bogota, Medellin y Cali.

## 4. Decisiones tecnicas

- Backend con NestJS por su estructura modular, guards, pipes de validacion y separacion clara entre controladores, servicios y modulos.
- Prisma como ORM para tipado fuerte, modelo declarativo y consultas agregadas.
- PostgreSQL como base principal porque era el motor preferido en la prueba.
- Frontend con React + Vite, separado del backend, con login, listado, filtros, paginacion y formulario de estudiantes.
- La autorizacion real vive en backend. El frontend solo oculta acciones para mejorar UX, pero los endpoints siguen validando rol y sede.
- Se usa soft delete para estudiantes mediante `deletedAt`, evitando eliminacion fisica accidental.

## 5. Seguridad y autorizacion

Implementado:

- Passwords hasheados con bcrypt y salt.
- JWT firmado con `JWT_SECRET` y expiracion configurable.
- Guards para rutas autenticadas y rutas exclusivas de ADMIN.
- `POST /api/auth/register`, CRUD de sedes y estadisticas protegidos para ADMIN.
- `PUT /api/estudiantes/:id` y `DELETE /api/estudiantes/:id` protegidos para ADMIN.
- OPERADOR no ve columna `Acciones` en frontend y tampoco puede editar/eliminar estudiantes por API.
- OPERADOR solo lista, consulta y crea estudiantes en su propia sede.
- ADMIN puede ver todas las sedes y estudiantes.
- Mensaje generico en login: no diferencia email inexistente, password incorrecto, usuario inactivo o bloqueo.
- Comparacion contra hash dummy cuando el email no existe, para reducir diferencias de timing.
- Bloqueo temporal tras 5 intentos fallidos.
- Helmet, CORS configurable y rate limiting global bajo `/api`.
- `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y transformacion de tipos.
- Variables sensibles por `.env`; `.env` esta ignorado por Git.

Pendiente con mas tiempo:

- Refresh tokens con rotacion y revocacion.
- Cookies `httpOnly` + `secure` + `sameSite` en vez de `localStorage` para el token del frontend.
- Rate limit especifico por email/IP en `/auth/login`.
- Auditoria de cambios por usuario.
- Logs estructurados con request id.
- Tests automatizados de guards y permisos por rol.

Mas detalle en `seguridad_revision.md`.

## 6. Que haria diferente con mas tiempo

- Tests unitarios e integracion con una base de datos de prueba.
- Swagger/OpenAPI para documentar contratos.
- Paginacion y busqueda tambien en sedes y usuarios.
- Soft delete para sedes con reglas mas explicitas para usuarios relacionados.
- Pipeline de CI que ejecute build, lint y tests.
- Despliegue automatizado con variables por ambiente.

## 7. Diagrama de base de datos

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
```

Relaciones:

- Una sede tiene muchos usuarios.
- Una sede tiene muchos estudiantes.
- Un estudiante pertenece a una sede.

## 8. Endpoints principales

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
- `DELETE /api/estudiantes/:id` - solo ADMIN, soft delete

Estadisticas:

- `GET /api/stats` - solo ADMIN

## 9. Comandos utiles de verificacion

Backend:

```bash
cd api
npm run build
```

Frontend:

```bash
cd web
npm run build
```

Git:

```bash
git status
git add .
git commit -m "fix: reforzar permisos y documentacion"
git push origin main
```
