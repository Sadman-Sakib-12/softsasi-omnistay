import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { UpdateUserDto } from '../dto/update-user.dto.js';
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
    // Validate caller membership in organization
    const isMember =
      caller.organizationId === organizationId ||
      caller.isSuperAdmin ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Platform SuperAdmin';

    if (!isMember) {
      throw new ForbiddenException('Cross-tenant access denied: Not a member of this organization');
    }

    const memberships = await this.prisma.membership.findMany({
      where: { organizationId },
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
      },
    });

    return memberships.map((m) => ({
      userId: m.user.id,
      email: m.user.email,
      name: m.user.name,
      status: m.user.status,
      isTwoFactorEnabled: m.user.isTwoFactorEnabled,
      role: m.role.name,
      joinedAt: m.createdAt,
    }));
  }
}

export const UsersService = UserService;
