import { Injectable, Logger } from '@nestjs/common';

/**
 * High-Delivery SMS Gateway Engine
 * Source: Sakib_Project_Plan.pdf (Chapter 17.3 SMS Gateway Engine & Chapter 19.5 2FA)
 */
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

  /**
   * Dispatches critical 6-digit One-Time Passwords (OTP) for account login,
   * verification, or smart door lock PIN delivery (Chapter 17.3 & 15.2).
   */
  async sendOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const maskedPhone = phoneNumber ? '***' + phoneNumber.slice(-4) : 'unknown';

    if (!this.isConfigured) {
      this.logger.log(
        `[SMS Dispatcher - Dev Simulation] To: ${maskedPhone} | Message: "Your SoftSasi OmniStay security code is: ${otp}. Valid for 5 minutes."`,
      );
      return true;
    }

    try {
      // In production with Twilio credentials configured
      const authHeader = 'Basic ' + Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`,
      ).toString('base64');

      const body = new URLSearchParams({
        To: phoneNumber,
        From: process.env.TWILIO_PHONE_NUMBER!,
        Body: `Your SoftSasi OmniStay security verification code is: ${otp}. Valid for 5 minutes. Do not share.`,
      });

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Twilio SMS dispatch failed: ${response.status} - ${errorText}`);
        return false;
      }

      this.logger.log(`Live SMS OTP successfully dispatched to ${maskedPhone}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Error sending SMS OTP: ${err.message}`);
      return false;
    }
  }
}
