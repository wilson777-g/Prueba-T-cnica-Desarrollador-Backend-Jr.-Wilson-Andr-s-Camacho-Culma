import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: TUser, info: any, context: ExecutionContext): TUser {
    const authenticated = super.handleRequest(err, user, info, context) as TUser & { csrf?: string };
    const request = context.switchToHttp().getRequest<{ method: string; headers: Record<string, string | undefined> }>();
    const unsafe = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
    const usesBearer = Boolean(request.headers.authorization?.startsWith('Bearer '));
    if (unsafe && !usesBearer) {
      const csrfHeader = request.headers['x-csrf-token'];
      if (!authenticated.csrf || !csrfHeader || csrfHeader !== authenticated.csrf) {
        throw new ForbiddenException('Token CSRF inválido o ausente');
      }
    }
    return authenticated;
  }
}
