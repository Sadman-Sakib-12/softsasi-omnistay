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
  async getTenantUsers(organizationId: string, caller?: AuthenticatedUserPayload) {
    const isSuperAdmin =
      !caller ||
      Boolean(caller.isSuperAdmin) ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Platform SuperAdmin';

    // If caller is regular user, always enforce caller's own organization
    let targetOrgId = organizationId;
    if (caller && !isSuperAdmin) {
      if (organizationId && caller.organizationId && organizationId !== caller.organizationId) {
        throw new ForbiddenException('Cannot access tenant users from another organization');
      }
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
              isSuperadmin: true,
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

      const seen = new Set<string>();
      const result = [];
      for (const m of allMemberships) {
        if (seen.has(m.user.id)) continue;
        seen.add(m.user.id);
        const isSuperAdminUser = Boolean(m.user.isSuperadmin || m.role?.name?.toLowerCase().includes('superadmin') || m.user.email === 'sadmansakib8530@gmail.com');
        result.push({
          id: m.user.id,
          userId: m.user.id,
          email: m.user.email,
          name: m.user.name,
          status: m.user.status,
          isTwoFactorEnabled: m.user.isTwoFactorEnabled,
          isSuperAdmin: isSuperAdminUser,
          role: isSuperAdminUser ? 'Platform SuperAdmin' : m.role.name,
          tenantId: isSuperAdminUser ? 'OmniStay Global HQ' : m.organization?.id,
          organizationName: isSuperAdminUser ? 'OmniStay Global HQ' : m.organization?.name,
          joinedAt: m.createdAt,
          createdAt: m.createdAt,
        });
      }
      return result;
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
            isSuperadmin: true,
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

    const seen = new Set<string>();
    const result = [];
    for (const m of memberships) {
      if (seen.has(m.user.id)) continue;
      seen.add(m.user.id);
      const isSuperAdminUser = Boolean(m.user.isSuperadmin || m.role?.name?.toLowerCase().includes('superadmin') || m.user.email === 'sadmansakib8530@gmail.com');
      result.push({
        id: m.user.id,
        userId: m.user.id,
        email: m.user.email,
        name: m.user.name,
        status: m.user.status,
        isTwoFactorEnabled: m.user.isTwoFactorEnabled,
        isSuperAdmin: isSuperAdminUser,
        role: isSuperAdminUser ? 'Platform SuperAdmin' : m.role.name,
        tenantId: isSuperAdminUser ? 'OmniStay Global HQ' : m.organization?.id,
        organizationName: isSuperAdminUser ? 'OmniStay Global HQ' : m.organization?.name,
        joinedAt: m.createdAt,
        createdAt: m.createdAt,
      });
    }
    return result;
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
        isSuperadmin: true,
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
    const isSuperAdminUser = Boolean(user.isSuperadmin || membership?.role?.name?.toLowerCase().includes('superadmin') || user.email === 'sadmansakib8530@gmail.com');

    return {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      phone: user.phone,
      avatar: user.avatar,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      isSuperAdmin: isSuperAdminUser,
      createdAt: user.createdAt,
      role: isSuperAdminUser ? 'Platform SuperAdmin' : (membership?.role?.name || 'Staff'),
      tenantId: isSuperAdminUser ? 'OmniStay Global HQ' : (membership?.organizationId || ''),
      organization: isSuperAdminUser
        ? {
            id: 'cb57c2f2-3810-4a0e-8af0-78ad02d69971',
            name: 'OmniStay Global HQ',
          }
        : membership?.organization
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
    dto: {
      email: string;
      name?: string;
      fullName?: string;
      role?: string;
      password?: string;
      organizationId?: string;
    },
    organizationId?: string,
    caller?: AuthenticatedUserPayload,
  ) {
    const isValidUuid = (val?: string): boolean =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

    const rawOrgId = [organizationId, caller?.organizationId, dto.organizationId].find(
      (id) => typeof id === 'string' && id.trim() !== '' && id !== 'all' && isValidUuid(id)
    );

    // Validate that orgId exists in database; fallback to first active organization
    let org = rawOrgId ? await this.prisma.organization.findUnique({ where: { id: rawOrgId } }) : null;
    if (!org) {
      org = await this.prisma.organization.findFirst({
        orderBy: { createdAt: 'asc' },
      });
    }

    if (!org) {
      throw new NotFoundException('No active organization found to attach user');
    }

    const resolvedOrgId = org.id;
    const finalRoleName = (dto.role || 'HOTEL_STAFF').trim();
    const finalEmail = (dto.email || '').toLowerCase().trim();
    const finalName = (dto.name || dto.fullName || dto.email?.split('@')[0] || 'Staff Member').trim();

    let user = await this.prisma.user.findUnique({
      where: { email: finalEmail },
    });

    const plainPassword = dto.password?.trim() || 'OmniStay@2026';

    if (!user) {
      const defaultHash = await bcrypt.hash(plainPassword, 10);
      user = await this.prisma.user.create({
        data: {
          email: finalEmail,
          name: finalName,
          passwordHash: defaultHash,
          tenantId: resolvedOrgId,
          status: 'ACTIVE',
        },
      });
    } else {
      const updateData: any = {};
      if (finalName && (!user.name || user.name !== finalName)) {
        updateData.name = finalName;
      }
      if (dto.password && dto.password.trim().length >= 6) {
        updateData.passwordHash = await bcrypt.hash(dto.password.trim(), 10);
      }
      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    }

    let role = await this.prisma.role.findFirst({
      where: { organizationId: resolvedOrgId, name: finalRoleName },
    });

    if (!role) {
      const defaultRolePerms: Record<string, string[]> = {
        CFO_ACCOUNTANT: ['finance:read', 'finance:write', 'reports:read', 'reports:export', 'reservations:read', 'audit:read'],
        FRONT_DESK_AGENT: ['rooms:read', 'rooms:write', 'reservations:read', 'reservations:write', 'frontdesk:read'],
        HOUSEKEEPING_SUPERVISOR: ['housekeeping:read', 'housekeeping:write', 'rooms:read'],
        POS_CASHIER: ['pos:read', 'pos:write', 'finance:read'],
        HR_DIRECTOR: ['hrm:read', 'hrm:write', 'users:read', 'users:write'],
        MAINTENANCE_ENGINEER: ['housekeeping:read', 'housekeeping:write', 'rooms:read'],
      };

      role = await this.prisma.role.create({
        data: {
          organizationId: resolvedOrgId,
          name: finalRoleName,
          description: `${finalRoleName} assigned to staff member`,
          permissions: defaultRolePerms[finalRoleName] || [],
        },
      });
    }

    const existingMembership = await this.prisma.membership.findFirst({
      where: { userId: user.id, organizationId: resolvedOrgId },
    });

    if (!existingMembership) {
      await this.prisma.membership.create({
        data: {
          userId: user.id,
          organizationId: resolvedOrgId,
          roleId: role.id,
        },
      });
    } else {
      await this.prisma.membership.update({
        where: { id: existingMembership.id },
        data: { roleId: role.id },
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: role.name,
      tenantId: resolvedOrgId,
      status: user.status,
      temporaryPassword: plainPassword,
      message: `User created. Initial login password: ${plainPassword}`,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateUserAdmin(id: string, dto: { name?: string; role?: string; status?: string; password?: string }) {
    let passwordHash: string | undefined;
    if (dto.password && dto.password.trim().length >= 6) {
      passwordHash = await bcrypt.hash(dto.password.trim(), 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(passwordHash ? { passwordHash } : {}),
      },
    });

    if (dto.role) {
      const membership = await this.prisma.membership.findFirst({
        where: { userId: id },
      });
      if (membership) {
        let role = await this.prisma.role.findFirst({
          where: { organizationId: membership.organizationId, name: dto.role },
        });
        if (!role) {
          role = await this.prisma.role.create({
            data: {
              organizationId: membership.organizationId,
              name: dto.role,
              description: `${dto.role} updated for staff member`,
              permissions: [],
            },
          });
        }
        await this.prisma.membership.update({
          where: { id: membership.id },
          data: { roleId: role.id },
        });
      }
    }

    return updated;
  }

  async deleteUserAdmin(id: string) {
    await this.prisma.membership.deleteMany({ where: { userId: id } });
    await this.prisma.user.delete({ where: { id } }).catch(async () => {
      await this.prisma.user.update({ where: { id }, data: { status: 'DEACTIVATED' } });
    });
    return { success: true };
  }
}

export const UsersService = UserService;
