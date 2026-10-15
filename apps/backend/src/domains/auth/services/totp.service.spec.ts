import { describe, it, expect, beforeEach } from 'vitest';
import { TotpService } from './totp.service.js';

describe('TotpService', () => {
  let service: TotpService;

  beforeEach(() => {
    service = new TotpService();
  });

  it('should generate a valid Base32 secret', () => {
    const secret = service.generateSecret();
    expect(secret).toBeDefined();
    expect(secret.length).toBeGreaterThanOrEqual(16);
    expect(/^[A-Z2-7]+$/.test(secret)).toBe(true);
  });

  it('should generate standard otpauth:// URI for Google Authenticator', () => {
    const secret = service.generateSecret();
    const uri = service.generateOtpAuthUri('admin@omnistay.com', secret);

    expect(uri).toContain('otpauth://totp/');
    expect(uri).toContain('OmniStay%20360');
    expect(uri).toContain('admin%40omnistay.com');
    expect(uri).toContain(`secret=${secret}`);
  });

  it('should verify a valid generated TOTP token', () => {
    const secret = service.generateSecret();
    const token = service.generateToken(secret);

    expect(token).toBeDefined();
    expect(token).toHaveLength(6);

    const isValid = service.verifyToken(token, secret);
    expect(isValid).toBe(true);
  });

  it('should reject an invalid TOTP token', () => {
    const secret = service.generateSecret();
    expect(service.verifyToken('12345', secret)).toBe(false);
    expect(service.verifyToken('', secret)).toBe(false);
  });
});
