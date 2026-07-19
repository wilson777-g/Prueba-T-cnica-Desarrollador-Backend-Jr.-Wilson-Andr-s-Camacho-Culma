# DNA Music — arquitectura y operación

## Componentes

- `web/`: React + Vite desplegado en Vercel. Todas las llamadas usan el proxy `/api`; el navegador no conoce la URL interna de Render.
- `api/`: NestJS desplegado en Render. Prisma aplica migraciones aditivas antes de iniciar.
- PostgreSQL: fuente única para usuarios, sedes, estudiantes, programas, matrículas y auditoría.
- Better Stack: consulta `GET /api/health` cada tres minutos y notifica al responsable por correo.

## Autenticación

1. El usuario envía credenciales por HTTPS al mismo origen del frontend.
2. El backend valida bcrypt, bloqueo temporal y estado de la cuenta.
3. La sesión se entrega en `dna_session`, cookie `HttpOnly`, `Secure`, `SameSite=Lax` con duración de una hora.
4. El JWT incluye versión de sesión y secreto CSRF. No se guarda en `localStorage`.
5. Toda mutación exige `X-CSRF-Token` ligado a la sesión.
6. Cambiar o restablecer contraseña incrementa `tokenVersion`, revocando sesiones anteriores.

## Matriz de permisos

| Operación | Administrador | Operador |
|---|---:|---:|
| Indicadores globales y auditoría | Sí | No |
| Sedes, programas y responsables | Administrar | Consultar oferta autorizada |
| Estudiantes | Todas las sedes | Solo sede asignada |
| Matrículas | Todas las sedes | Solo sede asignada |
| Restablecer credenciales | Sí, solo operadores | No |
| Cambiar contraseña propia | Sí | Sí |

Las restricciones se ejecutan en backend. Ocultar opciones en React no constituye autorización.

## Migraciones y despliegue

`prisma migrate deploy` se ejecuta antes de NestJS. Las migraciones de producción son aditivas; no se usa `db push`. El baseline solo se aplica a la base histórica cuando Prisma devuelve P3005.

## Quality gate

GitHub Actions crea PostgreSQL aislado, valida y aplica migraciones, carga datos de prueba, compila ambas aplicaciones, ejecuta Jest, auditoría de dependencias y recorridos Playwright. Los artefactos de fallos conservan trazas y capturas durante 14 días.

## Límites conocidos

- Render gratuito puede tardar en despertar. Better Stack detecta disponibilidad, pero el plan de pago es necesario para latencia estable.
- La recuperación autoservicio por correo requiere un proveedor transaccional y dominio verificado. No se simula en producción.
- Las credenciales públicas corresponden exclusivamente a datos de evaluación, nunca a información personal real.
