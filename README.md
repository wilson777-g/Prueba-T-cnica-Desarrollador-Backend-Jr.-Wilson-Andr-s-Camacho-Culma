# DNA Music - Prueba tecnica Backend Jr.

Mini aplicacion para gestion de estudiantes por sede. El repo esta separado en `api/` para el backend NestJS y `web/` para el frontend React.

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

## 2. URLs de despliegue

- Backend: pendiente de publicar.
- Frontend: pendiente de publicar.

Antes de entregar la prueba se deben reemplazar estos valores por las URLs reales de Render/Railway/Fly/Vercel.

## 3. Credenciales de prueba

El seed crea estos usuarios:

- ADMIN: `admin@dnamusic.co` / `Admin123!`
- OPERADOR BOG: `operador.bog@dnamusic.co` / `Oper123!`
- OPERADOR MED: `operador.med@dnamusic.co` / `Oper123!`

Tambien crea 3 sedes activas y 6 estudiantes distribuidos entre Bogota, Medellin y Cali.

## 4. Decisiones tecnicas

- Backend con NestJS por su estructura modular, guards, pipes de validacion y buena separacion entre controladores, servicios y modulos.
- Prisma como ORM para tipado fuerte, migraciones/db push y consultas agregadas.
- PostgreSQL como base principal porque era el motor preferido en el PDF.
- Frontend con React + Vite, separado del backend, con login, listado, filtros y creacion de estudiantes.
- La autorizacion de negocio vive en servicios: un operador solo consulta y gestiona estudiantes de su sede; un admin puede operar sobre todas.

## 5. Decisiones de seguridad

Implementado:

- Passwords hasheados con bcrypt y salt.
- JWT con expiracion configurable.
- Guards para rutas autenticadas y rutas exclusivas de ADMIN.
- Mensaje generico en login: no diferencia email inexistente, password incorrecto, usuario inactivo o bloqueo.
- Comparacion contra hash dummy cuando el email no existe, para reducir diferencias de timing.
- Bloqueo temporal tras 5 intentos fallidos.
- Helmet, CORS configurable y rate limiting global bajo `/api`.
- ValidationPipe global con `whitelist` y `forbidNonWhitelisted`.
- Variables sensibles por `.env`; `.env` esta ignorado por Git.

Con mas tiempo agregaria:

- Refresh tokens con rotacion y revocacion.
- Cookies `httpOnly` en vez de `localStorage` para el token del frontend.
- Rate limit especifico por email/IP en `/auth/login`.
- Auditoria de cambios por usuario.
- Logs estructurados con request id.

## 6. Que haria diferente con mas tiempo

- Tests unitarios e integracion con una base de datos de prueba.
- Swagger/OpenAPI.
- Paginacion y busqueda mas completas en sedes y usuarios.
- Soft delete para sedes con restricciones mas explicitas.
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

## 8. Comandos Git utilizados

```bash
git init
git add .
git commit -m "feat: setup inicial del backend con NestJS, Prisma y autenticacion JWT"
git status
git log --oneline
```

Para continuar el desarrollo:

```bash
git add .
git commit -m "fix: completar reglas de seguridad y entrega"
git remote add origin <url-del-repo>
git push -u origin main
```

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
- `POST /api/estudiantes`
- `PUT /api/estudiantes/:id`
- `DELETE /api/estudiantes/:id`

Estadisticas:

- `GET /api/stats` - solo ADMIN
