import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import type { CorrelatedRequest } from '../middleware/correlation-id.middleware.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<CorrelatedRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message: string | string[] = 'Internal server error';

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      message = (exceptionResponse as { message: string | string[] }).message;
    } else if (exception instanceof Error && status !== HttpStatus.INTERNAL_SERVER_ERROR) {
      message = exception.message;
    }

    const correlationId = String(request.correlationId || request.headers['x-correlation-id'] || '');

    if (status >= 500) {
      this.logger.error(
        `[${correlationId}] 500 Internal Error: ${request.method} ${request.url} - ${
          exception instanceof Error ? exception.stack : JSON.stringify(exception)
        }`,
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId,
    });
  }
}
