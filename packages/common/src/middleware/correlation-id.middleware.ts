import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

export interface CorrelatedRequest extends Request {
  correlationId?: string;
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: CorrelatedRequest, res: Response, next: NextFunction) {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || crypto.randomUUID();

    req.correlationId = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    next();
  }
}
