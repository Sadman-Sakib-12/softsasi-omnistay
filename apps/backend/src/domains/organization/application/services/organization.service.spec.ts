import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { OrganizationService } from './organization.service.js';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      membership: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      organization: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      role: {
        create: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(mockPrisma)),
    };
    service = new OrganizationService(mockPrisma);
  });

  it('should return all organizations where user has membership', async () => {
    mockPrisma.membership.findMany.mockResolvedValueOnce([
      {
        organization: { id: 'org-1', name: 'Grand Palace', slug: 'grand-palace' },
        role: { name: 'Company Owner/GM', permissions: ['all'] },
        createdAt: new Date(),
      },
    ]);

    const result = await service.getUserOrganizations('user-1');
    expect(result).toHaveLength(1);
    expect(result[0].organizationId).toBe('org-1');
    expect(result[0].role).toBe('Company Owner/GM');
  });

  it('should throw ForbiddenException if user is not a member of the organization', async () => {
    mockPrisma.membership.findUnique.mockResolvedValueOnce(null);

    const caller = {
      userId: 'user-hacker',
      email: 'hacker@other.com',
      name: 'Hacker',
      permissions: [],
      isSuperAdmin: false,
      is2faVerified: true,
    };

    await expect(service.getOrganizationById('org-target', caller)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should return organization details for legitimate member', async () => {
    mockPrisma.membership.findUnique.mockResolvedValueOnce({
      id: 'mem-1',
      organizationId: 'org-1',
      userId: 'user-1',
    });
    mockPrisma.organization.findUnique.mockResolvedValueOnce({
      id: 'org-1',
      name: 'Grand Palace',
      slug: 'grand-palace',
      hotels: [],
      _count: { memberships: 5, hotels: 2 },
    });

    const caller = {
      userId: 'user-1',
      email: 'gm@grandpalace.com',
      name: 'GM',
      permissions: ['properties:read'],
      isSuperAdmin: false,
      is2faVerified: true,
    };

    const org = await service.getOrganizationById('org-1', caller);
    expect(org.id).toBe('org-1');
    expect(org.name).toBe('Grand Palace');
  });

  it('should allow SuperAdmin with tenant:manage permission to view organization', async () => {
    mockPrisma.organization.findUnique.mockResolvedValueOnce({
      id: 'org-1',
      name: 'Grand Palace',
      slug: 'grand-palace',
      hotels: [],
      _count: { memberships: 5, hotels: 2 },
    });

    const superAdmin = {
      userId: 'admin-1',
      email: 'admin@omnistay.com',
      name: 'SuperAdmin',
      role: 'SuperAdmin',
      permissions: ['system:root', 'tenant:manage'],
      isSuperAdmin: true,
      is2faVerified: true,
    };

    const org = await service.getOrganizationById('org-1', superAdmin);
    expect(org.id).toBe('org-1');
  });

  it('should reject organization creation if user lacks permissions', async () => {
    const regularUser = {
      userId: 'user-guest',
      email: 'guest@traveler.com',
      name: 'Guest',
      role: 'Guest/Traveler',
      permissions: [],
      isSuperAdmin: false,
      is2faVerified: true,
    };

    await expect(
      service.createOrganization({ name: 'New Org', slug: 'new-org' }, regularUser),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should reject organization creation if slug is already taken', async () => {
    const admin = {
      userId: 'admin-1',
      email: 'admin@omnistay.com',
      name: 'SuperAdmin',
      role: 'SuperAdmin',
      permissions: ['system:root'],
      isSuperAdmin: true,
      is2faVerified: true,
    };

    mockPrisma.organization.findUnique.mockResolvedValueOnce({ id: 'existing-id' });

    await expect(
      service.createOrganization({ name: 'Existing Org', slug: 'existing' }, admin),
    ).rejects.toThrow(ConflictException);
  });
});
