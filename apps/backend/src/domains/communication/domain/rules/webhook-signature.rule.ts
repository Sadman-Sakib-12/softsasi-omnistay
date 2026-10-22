import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Pure Domain Rules for Webhook HMAC Signature Generation and Verification
 * Zero external framework or database dependencies.
 */

export function generateHmacSignature(payload: string, secretKey: string): string {
  return createHmac('sha256', secretKey).update(payload).digest('hex');
}

export function verifyHmacSignature(payload: string, signature: string, secretKey: string): boolean {
  if (!payload || !signature || !secretKey) return false;

  const expected = createHmac('sha256', secretKey).update(payload).digest('hex');
  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(sigBuffer, expectedBuffer);
}
