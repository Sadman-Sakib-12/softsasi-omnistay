export const QUEUE_NAMES = {
  NOTIFICATION: 'notifications',
} as const;

export const JOB_NAMES = {
  NOTIFICATION_PASSWORD_RESET: 'notification:password-reset',
  NOTIFICATION_2FA_ALERT: 'notification:2fa-alert',
} as const;

export interface PasswordResetJobPayload {
  userId: string;
  email: string;
  token: string;
  expiresInMinutes: number;
}

export interface TwoFactorAlertJobPayload {
  userId: string;
  email: string;
  action: 'ENABLED' | 'DISABLED';
  ipAddress?: string;
}
