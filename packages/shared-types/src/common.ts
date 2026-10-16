/**
 * Softsasi OmniStay 360 - Common API & HTTP Envelope Contracts
 */

export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string | string[];
  data?: T;
  timestamp?: string;
  path?: string;
  correlationId?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp: string;
  path: string;
  correlationId?: string;
}

export interface HealthCheckResponse {
  status: 'UP' | 'DOWN';
  uptime?: string;
  database?: 'connected' | 'unavailable';
  redis?: 'connected' | 'unavailable';
  timestamp: string;
}
