import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const rawSecret =
      process.env.ENCRYPTION_KEY ||
      process.env.JWT_SECRET ||
      'omnistay_fallback_secure_key_2026_at_least_32_bytes_long';
    // Derive a fixed 32-byte key using sha256
    this.key = crypto.createHash('sha256').update(rawSecret).digest();
  }

  /**
   * Encrypts plaintext string using AES-256-GCM.
   * Returns formatted string: iv:authTag:ciphertext
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts ciphertext formatted as iv:authTag:ciphertext using AES-256-GCM.
   */
  decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format');
    }

    const [ivHex, authTagHex, cipherHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Compute a secure SHA-256 hash (used for refresh tokens, recovery codes).
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate cryptographically secure random recovery codes.
   */
  generateRecoveryCodes(count = 8): { plainCodes: string[]; hashedCodes: string[] } {
    const plainCodes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(5).toString('hex').toLowerCase();
      const formatted = `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8)}`;
      plainCodes.push(formatted);
      hashedCodes.push(this.hashToken(formatted));
    }

    return { plainCodes, hashedCodes };
  }
}
