import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly isConfigured: boolean;

  constructor() {
    this.isConfigured = Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER,
    );
  }

  isOperational(): boolean {
    return this.isConfigured;
  }

  async sendOtp(phoneNumber: string, _otp: string): Promise<boolean> {
    if (!this.isConfigured) {
      this.logger.warn(
        `SMS provider integration is not configured. Falling back to TOTP. (Recipient: ${
          phoneNumber ? '***' + phoneNumber.slice(-4) : 'unknown'
        })`,
      );
      return false;
    }
    return true;
  }
}
