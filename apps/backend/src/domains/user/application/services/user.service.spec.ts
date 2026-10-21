import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service.js';

describe('UserService', () => {
  let service: UserService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      membership: {
        findMany: vi.fn(),
      },
    };
    service = new UserService(mockPrisma);
  });

  it('should return sanitized user profile without leaking passwordHash or 2FA secret', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'usr-1',
      email: 'user@hotel.com',
      name: 'John Doe',
      status: 'ACTIVE',
      isTwoFactorEnabled: true,
      twoFactorConfirmedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      memberships: [],
    });

    const profile = await service.getProfile('usr-1');
    expect(profile.email).toBe('user@hotel.com');
    expect((profile as any).passwordHash).toBeUndefined();
    expect((profile as any).twoFactorSecret).toBeUndefined();
  });

  it('should throw NotFoundException if profile does not exist', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    await expect(service.getProfile('non-existent')).rejects.toThrow(NotFoundException);
  });

  it('should reject getTenantUsers if caller is from another organization', async () => {
    const caller = {
      userId: 'usr-2',
      email: 'intruder@other.com',
      name: 'Intruder',
      organizationId: 'org-other',
      role: 'Front Desk Agent',
      permissions: [],
      isSuperAdmin: false,
      is2faVerified: true,
    };

    await expect(service.getTenantUsers('org-target', caller)).rejects.toThrow(ForbiddenException);
  });
});
