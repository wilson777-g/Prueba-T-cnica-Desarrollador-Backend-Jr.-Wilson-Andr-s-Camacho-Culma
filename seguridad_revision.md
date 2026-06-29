# Revision de seguridad

Esta revision resume las decisiones implementadas y los puntos conocidos para una entrevista tecnica. La idea principal es que la seguridad no dependa del frontend.

## Autenticacion

- Login con email y contrasena.
- Passwords almacenados con bcrypt, no en texto plano.
- JWT firmado con `JWT_SECRET` y expiracion configurable por `JWT_EXPIRATION`.
- Estrategia JWT valida que el usuario exista, este activo y no tenga `deletedAt`.
- Mensaje de login generico: `Credenciales invalidas`.
- Hash dummy cuando el email no existe para reducir diferencias de timing.
- Bloqueo temporal tras 5 intentos fallidos de password.

## Autorizacion

Matriz actual:

| Recurso | ADMIN | OPERADOR |
| --- | --- | --- |
| Login | Si | Si |
| Registrar usuarios | Si | No |
| Ver sedes | Todas | Solo su sede |
| Crear/editar/eliminar sedes | Si | No |
| Ver estudiantes | Todos | Solo su sede |
| Crear estudiantes | Si | Solo en su sede |
| Editar estudiantes | Si | No |
| Suspender/desactivar estudiantes | Si | No |
| Eliminar estudiantes | Si, salvo demo publico | No |
| Estadisticas | Si | No |

El frontend oculta la columna `Acciones` para OPERADOR, pero la proteccion importante esta en backend: `PUT /api/estudiantes/:id`, `PATCH /api/estudiantes/:id/suspender`, `PATCH /api/estudiantes/:id/desactivar` y `DELETE /api/estudiantes/:id` usan `AdminGuard`.

En demo publico, `DELETE /api/estudiantes/:id` queda bloqueado adicionalmente con `DEMO_MODE=true` para evitar operaciones destructivas en el entorno publicado.

## Validacion de entradas

- `ValidationPipe` global con `whitelist` y `forbidNonWhitelisted`.
- DTOs con validacion de email, longitud minima, valores permitidos y formatos de telefono/documento.
- Trimming y normalizacion de email en servicios antes de persistir.
- Paginacion con limite maximo de 100 registros en estudiantes.

## Headers, CORS y rate limit

- Helmet activo para headers HTTP defensivos.
- CORS configurable por `CORS_ORIGIN`; en produccion debe apuntar al dominio publico del frontend.
- Rate limiting global bajo `/api`.

## Datos sensibles

- `.env` no esta versionado.
- `.env.example` contiene solo valores de ejemplo.
- Las credenciales del seed son de demo para evaluacion tecnica; en produccion se cambiarian o se eliminaria el seed publico.

## Riesgos conocidos y siguientes pasos

- El frontend guarda el access token en `localStorage`; para produccion preferiria cookies `httpOnly`, `secure` y `sameSite`.
- Falta refresh token con rotacion y revocacion.
- Falta auditoria de cambios para saber quien creo, edito o elimino registros.
- Falta test automatizado que pruebe explicitamente que OPERADOR recibe `403` en editar/eliminar estudiantes.
- Falta rate limit especializado para `/api/auth/login` por email e IP.
