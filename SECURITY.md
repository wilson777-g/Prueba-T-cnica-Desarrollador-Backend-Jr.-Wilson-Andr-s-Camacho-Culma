# Política de seguridad

No publiques vulnerabilidades, tokens, enlaces de invitación ni datos personales en Issues.

## Controles activos

- Cookies HttpOnly/Secure/SameSite, CSRF por sesión y JWT con expiración.
- Revocación mediante versión, bloqueo por intentos fallidos y rate limiting diferenciado.
- bcrypt con coste 12 para credenciales nuevas o actualizadas.
- Validación allowlist y rechazo de propiedades inesperadas.
- autorización por rol y sede en servidor.
- auditoría transaccional sin contraseñas ni tokens.
- errores sin stack trace y con `X-Request-Id` correlacionable.

## Gestión de secretos

`DATABASE_URL`, `JWT_SECRET` y futuras claves de correo se guardan únicamente en el proveedor de despliegue. Nunca se incluyen en Git, capturas o documentación.

## Recuperación de cuentas

El administrador puede emitir una credencial temporal para un operador. Esta acción revoca sesiones, se audita y obliga a cambiar la clave. La contraseña temporal se muestra una sola vez y nunca se persiste en texto plano.

## Reporte responsable

Reporta el problema de forma privada al propietario del repositorio incluyendo impacto, pasos mínimos de reproducción y evidencia redactada. No incluyas datos de terceros.
