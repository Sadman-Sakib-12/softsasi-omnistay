import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { HotelService } from './hotel.service.js';

describe('HotelService', () => {
  let service: HotelService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      hotel: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };
    service = new HotelService(mockPrisma);
  });

  it('should list properties scoped to the organization', async () => {
    mockPrisma.hotel.findMany.mockResolvedValueOnce([
      { id: 'htl-1', name: 'Grand Palace Dhaka', code: 'GPD' },
    ]);

    const hotels = await service.listProperties('org-1');
    expect(hotels).toHaveLength(1);
    expect(hotels[0].code).toBe('GPD');
  });

  it('should throw ForbiddenException if creating property without organization context', async () => {
    const caller = {
      userId: 'usr-1',
      email: 'gm@hotel.com',
      name: 'GM',
      role: 'Company Owner/GM',
      permissions: ['properties:manage'],
      isSuperAdmin: false,
      is2faVerified: true,
    };

    await expect(
      service.createProperty({ name: 'Hotel', code: 'HTL' }, '', caller),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should reject property creation if code is already registered in that organization', async () => {
    mockPrisma.hotel.findUnique.mockResolvedValueOnce({ id: 'existing-htl' });

    const caller = {
      userId: 'usr-1',
      email: 'gm@hotel.com',
      name: 'GM',
      role: 'Company Owner/GM',
      permissions: ['properties:manage'],
      isSuperAdmin: false,
      is2faVerified: true,
    };

    await expect(
      service.createProperty({ name: 'Duplicate Code', code: 'DUP' }, 'org-1', caller),
    ).rejects.toThrow(ConflictException);
  });
});
