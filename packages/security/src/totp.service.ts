import { Injectable } from '@nestjs/common';
import { generateSecret, generateURI, generateSync, verifySync } from 'otplib';

@Injectable()
export class TotpService {
  /**
   * Generate a fresh base32 secret for TOTP.
   */
  generateSecret(): string {
    return generateSecret({ length: 20 });
  }

  /**
   * Generate standard otpauth URL for Google Authenticator QR codes.
   */
  generateOtpAuthUri(userEmail: string, secret: string): string {
    return generateURI({
      issuer: 'OmniStay 360',
      label: userEmail,
      secret,
    });
  }

  /**
   * Verify a 6-digit TOTP token against the plaintext secret.
   * Window tolerance allows +/- 30 seconds for clock drift.
   */
  verifyToken(token: string, secret: string): boolean {
    if (!token || !secret || token.trim().length !== 6) {
      return false;
    }
    const result = verifySync({
      token: token.trim(),
      secret: secret.trim(),
      epochTolerance: 30,
    });
    return result.valid;
  }

  /**
   * Generate current TOTP code for testing/verification.
   */
  generateToken(secret: string): string {
    return generateSync({ secret: secret.trim() });
  }
}
