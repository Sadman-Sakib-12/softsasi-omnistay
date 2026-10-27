import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { UpdateUserDto } from '../../presentation/dto/update-user.dto.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Retrieves profile of currently authenticated user without leaking credentials or secrets.
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        isTwoFactorEnabled: true,
        twoFactorConfirmedAt: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
          select: {
            id: true,
            organizationId: true,
            organization: {
              select: { id: true, name: true, slug: true },
            },
            role: {
              select: { id: true, name: true, permissions: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  /**
   * Updates user name or password securely.
   */
  async updateProfile(userId: string, dto: UpdateUserDto) {
    const data: Record<string, any> = {};
    if (dto.name) {
      data.name = dto.name.trim();
    }
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        isTwoFactorEnabled: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Lists users belonging to an organization, enforcing server-side membership validation.
   */
  async getTenantUsers(organizationId: string, caller: AuthenticatedUserPayload) {
    const isSuperAdmin =
      Boolean(caller.isSuperAdmin) ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Platform SuperAdmin';

    // If caller is regular user, always enforce caller's own organization
    let targetOrgId = organizationId;
    if (!isSuperAdmin) {
      targetOrgId = caller.organizationId || organizationId;
    } else if (!targetOrgId || targetOrgId === 'all') {
      // SuperAdmin with no target org: return all users across all tenants
      const allMemberships = await this.prisma.membership.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              status: true,
              isTwoFactorEnabled: true,
              createdAt: true,
            },
          },
          role: {
            select: { id: true, name: true },
          },
          organization: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return allMemberships.map((m) => ({
        id: m.user.id,
        userId: m.user.id,
        email: m.user.email,
        name: m.user.name,
        status: m.user.status,
        isTwoFactorEnabled: m.user.isTwoFactorEnabled,
        role: m.role.name,
        tenantId: m.organization?.id,
        organizationName: m.organization?.name,
        joinedAt: m.createdAt,
        createdAt: m.createdAt,
      }));
    }

    const memberships = await this.prisma.membership.findMany({
      where: { organizationId: targetOrgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            status: true,
            isTwoFactorEnabled: true,
            createdAt: true,
          },
        },
        role: {
          select: { id: true, name: true },
        },
        organization: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return memberships.map((m) => ({
      id: m.user.id,
      userId: m.user.id,
      email: m.user.email,
      name: m.user.name,
      status: m.user.status,
      isTwoFactorEnabled: m.user.isTwoFactorEnabled,
      role: m.role.name,
      tenantId: m.organization?.id,
      organizationName: m.organization?.name,
      joinedAt: m.createdAt,
      createdAt: m.createdAt,
    }));
  }

  /**
   * Retrieves single user profile by UUID.
   */
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        phone: true,
        avatar: true,
        isTwoFactorEnabled: true,
        createdAt: true,
        memberships: {
          include: {
            role: true,
            organization: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const membership = user.memberships[0];

    return {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      phone: user.phone,
      avatar: user.avatar,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      createdAt: user.createdAt,
      role: membership?.role?.name || 'Staff',
      tenantId: membership?.organizationId || '',
      organization: membership?.organization
        ? {
            id: membership.organization.id,
            name: membership.organization.name,
          }
        : null,
    };
  }

  /**
   * Invites and provisions a new staff user and assigns role membership.
   */
  async inviteUser(
    dto: { email: string; name: string; role: string },
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const orgId = organizationId || caller.organizationId || '00000000-0000-0000-0000-000000000001';
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      const defaultHash = await bcrypt.hash('OmniStay@2026', 10);
      user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          name: dto.name.trim(),
          passwordHash: defaultHash,
          tenantId: orgId,
          status: 'ACTIVE',
        },
      });
    }

    let role = await this.prisma.role.findFirst({
      where: { organizationId: orgId, name: dto.role },
    });

    if (!role) {
      role = await this.prisma.role.create({
        data: {
          organizationId: orgId,
          name: dto.role,
          description: `${dto.role} assigned to staff member`,
          permissions: [],
        },
      });
    }

    const existingMembership = await this.prisma.membership.findFirst({
      where: { userId: user.id, organizationId: orgId },
    });

    if (!existingMembership) {
      await this.prisma.membership.create({
        data: {
          userId: user.id,
          organizationId: orgId,
          roleId: role.id,
        },
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: role.name,
      tenantId: orgId,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

export const UsersService = UserService;
