import { describe, it, expect, beforeEach } from 'vitest';
import { CryptoService } from './crypto.service.js';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    service = new CryptoService();
  });

  it('should encrypt and decrypt plaintext using AES-256-GCM', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const encrypted = service.encrypt(secret);

    expect(encrypted).not.toBe(secret);
    expect(encrypted.split(':')).toHaveLength(3); // iv:authTag:ciphertext

    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(secret);
  });

  it('should throw an error when attempting to decrypt corrupted data', () => {
    const encrypted = service.encrypt('test-secret');
    const parts = encrypted.split(':');
    const tampered = `${parts[0]}:${parts[1]}:badf00d`;

    expect(() => service.decrypt(tampered)).toThrow();
  });

  it('should generate consistent SHA-256 hashes', () => {
    const token = 'sample-refresh-token-12345';
    const hash1 = service.hashToken(token);
    const hash2 = service.hashToken(token);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('should generate valid recovery codes and their hashes', () => {
    const { plainCodes, hashedCodes } = service.generateRecoveryCodes(8);

    expect(plainCodes).toHaveLength(8);
    expect(hashedCodes).toHaveLength(8);

    plainCodes.forEach((code, idx) => {
      expect(code).toMatch(/^[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{2}$/);
      expect(service.hashToken(code)).toBe(hashedCodes[idx]);
    });
  });
});
