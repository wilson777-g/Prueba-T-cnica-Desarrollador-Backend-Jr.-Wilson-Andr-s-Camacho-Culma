import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request & { requestId?: string }>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : null;
    const message = typeof payload === 'string' ? payload : (payload as { message?: string | string[] } | null)?.message || 'Error interno del servidor';
    const requestId = request.requestId || 'unknown';

    console.error(JSON.stringify({ level: 'error', requestId, method: request.method, path: request.originalUrl, status, error: exception instanceof Error ? exception.name : 'UnknownError' }));
    response.status(status).json({ statusCode: status, message, requestId, timestamp: new Date().toISOString(), path: request.originalUrl });
  }
}
