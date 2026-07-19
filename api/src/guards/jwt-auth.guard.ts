import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

type SessionUser = { csrf?: string; mustChangePassword?: boolean };
type SessionRequest = { method: string; url: string; headers: Record<string, string | undefined> };

export function enforceSessionSecurity(authenticated: SessionUser, request: SessionRequest) {
  const forcedPasswordAllowed = ['/api/auth/change-password', '/api/auth/logout', '/api/auth/verify'].some(path => request.url.startsWith(path));
  if (authenticated.mustChangePassword && !forcedPasswordAllowed) {
    throw new ForbiddenException('Debes cambiar la contraseña temporal antes de continuar');
  }
  const unsafe = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  if (unsafe) {
    const csrfHeader = request.headers['x-csrf-token'];
    if (!authenticated.csrf || !csrfHeader || csrfHeader !== authenticated.csrf) {
      throw new ForbiddenException('Token CSRF inválido o ausente');
    }
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: TUser, info: any, context: ExecutionContext): TUser {
    const authenticated = super.handleRequest(err, user, info, context) as TUser & SessionUser;
    const request = context.switchToHttp().getRequest<SessionRequest>();
    enforceSessionSecurity(authenticated, request);
    return authenticated;
  }
}
