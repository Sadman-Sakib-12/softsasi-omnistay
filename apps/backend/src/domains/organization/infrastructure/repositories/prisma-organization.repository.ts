import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IOrganizationRepository } from '../../domain/repositories/organization.repository.interface.js';

@Injectable()
export class PrismaOrganizationRepository implements IOrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserMemberships(userId: string): Promise<any[]> {
    return this.prisma.membership.findMany({
      where: { userId },
      include: {
        organization: true,
        role: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findMembership(organizationId: string, userId: string): Promise<any | null> {
    return this.prisma.membership.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  }

  async findOrganizationById(orgId: string): Promise<any | null> {
    return this.prisma.organization.findUnique({
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
  }

  async findOrganizationBySlug(slug: string): Promise<any | null> {
    return this.prisma.organization.findUnique({
      where: { slug },
    });
  }

  async createOrganizationWithDefaults(data: {
    name: string;
    slug: string;
    creatorUserId: string;
    defaultPermissions: string[];
  }): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: data.name,
          slug: data.slug,
        },
      });

      const ownerRole = await tx.role.create({
        data: {
          organizationId: organization.id,
          name: 'Company Owner/GM',
          description: 'Tenant Administrator with full property & operations access',
          isSystemRole: true,
          permissions: data.defaultPermissions,
        },
      });

      await tx.membership.create({
        data: {
          organizationId: organization.id,
          userId: data.creatorUserId,
          roleId: ownerRole.id,
        },
      });

      return organization;
    });
  }
}
