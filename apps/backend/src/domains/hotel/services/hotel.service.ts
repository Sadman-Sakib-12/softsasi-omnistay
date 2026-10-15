import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateHotelDto } from '../dto/create-hotel.dto.js';
import type { AuthenticatedUserPayload } from '../../../common/decorators/current-user.decorator.js';

@Injectable()
export class HotelService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lists properties/hotels belonging to the authenticated tenant organization.
   */
  async listProperties(organizationId?: string, caller?: AuthenticatedUserPayload) {
    const targetOrgId = organizationId || caller?.organizationId;
    if (!targetOrgId) {
      return [];
    }

    return this.prisma.hotel.findMany({
      where: { organizationId: targetOrgId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        organizationId: true,
        name: true,
        code: true,
        timezone: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Retrieves a single property by ID within the tenant.
   */
  async getPropertyById(id: string, organizationId?: string) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id },
      include: {
        organization: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!hotel) {
      throw new NotFoundException('Property not found');
    }

    if (organizationId && hotel.organizationId !== organizationId) {
      throw new ForbiddenException('Cross-tenant data access denied: Property belongs to another organization');
    }

    return hotel;
  }

  /**
   * Creates a new hotel property profile linked to the organization.
   */
  async createProperty(
    dto: CreateHotelDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    if (!organizationId) {
      throw new ForbiddenException('Organization context is required to create a property');
    }

    // Role check: Only Company Owner/GM or SuperAdmin can create properties
    const canCreate =
      caller.isSuperAdmin ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Company Owner/GM' ||
      caller.permissions.includes('properties:manage');

    if (!canCreate) {
      throw new ForbiddenException('Insufficient permissions to create property profiles');
    }

    const existingCode = await this.prisma.hotel.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code: dto.code.trim().toUpperCase(),
        },
      },
    });

    if (existingCode) {
      throw new ConflictException(`Property code '${dto.code}' already exists in this organization`);
    }

    return this.prisma.hotel.create({
      data: {
        organizationId,
        name: dto.name.trim(),
        code: dto.code.trim().toUpperCase(),
        timezone: dto.timezone || 'Asia/Dhaka',
        currency: dto.currency || 'BDT',
      },
    });
  }
}

export const HotelsService = HotelService;
