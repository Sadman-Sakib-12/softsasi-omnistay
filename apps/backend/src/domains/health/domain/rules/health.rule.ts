export interface SystemReadinessEvaluation {
  status: 'UP' | 'DEGRADED' | 'DOWN';
  database: 'connected' | 'disconnected';
  redis: 'connected' | 'unavailable';
  timestamp: string;
}

export function formatUptime(uptimeSeconds: number): string {
  const seconds = Math.max(0, Math.floor(uptimeSeconds));
  return `${seconds}s`;
}

export function evaluateSystemStatus(
  dbConnected: boolean,
  redisConnected: boolean,
): SystemReadinessEvaluation {
  const status = dbConnected && redisConnected ? 'UP' : (dbConnected ? 'DEGRADED' : 'DOWN');
  return {
    status,
    database: dbConnected ? 'connected' : 'disconnected',
    redis: redisConnected ? 'connected' : 'unavailable',
    timestamp: new Date().toISOString(),
  };
}
