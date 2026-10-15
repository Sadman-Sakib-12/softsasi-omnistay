import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateOrganizationDto } from '../dto/create-organization.dto.js';
import type { AuthenticatedUserPayload } from '../../../common/decorators/current-user.decorator.js';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all organizations where the authenticated user has verified membership.
   */
  async getUserOrganizations(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: {
        organization: true,
        role: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) => ({
      organizationId: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      role: m.role.name,
      permissions: m.role.permissions,
      joinedAt: m.createdAt,
    }));
  }

  /**
   * Retrieves an organization by ID with strict server-side membership validation.
   */
  async getOrganizationById(orgId: string, user: AuthenticatedUserPayload) {
    // Check if user is SuperAdmin with system permission
    const isSuperAdminWithPerm =
      (user.isSuperAdmin || user.role === 'SuperAdmin') &&
      (user.permissions.includes('system:root') ||
        user.permissions.includes('tenant:manage') ||
        user.permissions.includes('tenant:audit'));

    if (!isSuperAdminWithPerm) {
      // Must be a verified member of this organization
      const membership = await this.prisma.membership.findUnique({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId: user.userId,
          },
        },
      });

      if (!membership) {
        throw new ForbiddenException(
          'Cross-tenant access denied: Not a member of this organization',
        );
      }
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        hotels: {
          select: { id: true, name: true, code: true, timezone: true, currency: true },
        },
        _count: {
          select: { memberships: true, hotels: true },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  /**
   * Creates a new tenant organization (allowed only for authorized users).
   */
  async createOrganization(dto: CreateOrganizationDto, user: AuthenticatedUserPayload) {
    // Check if user has permission to create organizations (SuperAdmin or platform administrator)
    const canCreate =
      user.isSuperAdmin ||
      user.role === 'SuperAdmin' ||
      user.permissions.includes('tenant:create');

    if (!canCreate) {
      throw new ForbiddenException('Insufficient permissions to create a new organization');
    }

    const existingSlug = await this.prisma.organization.findUnique({
      where: { slug: dto.slug.toLowerCase().trim() },
    });

    if (existingSlug) {
      throw new ConflictException(`Organization slug '${dto.slug}' is already registered`);
    }

    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: dto.name.trim(),
          slug: dto.slug.toLowerCase().trim(),
        },
      });

      // Provision default Company Owner/GM role for this tenant
      const ownerRole = await tx.role.create({
        data: {
          organizationId: organization.id,
          name: 'Company Owner/GM',
          description: 'Tenant Administrator with full property & operations access',
          isSystemRole: true,
          permissions: [
            'properties:manage',
            'rooms:manage',
            'rates:manage',
            'reservations:manage',
            'staff:manage',
            'finance:read',
            'reports:view',
          ],
        },
      });

      // Bind creator as member with the Company Owner/GM role
      await tx.membership.create({
        data: {
          organizationId: organization.id,
          userId: user.userId,
          roleId: ownerRole.id,
        },
      });

      return organization;
    });
  }
}

export const OrganizationsService = OrganizationService;
