import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IUserRepository } from '../../domain/repositories/user.repository.interface.js';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProfileById(userId: string): Promise<any | null> {
    return this.prisma.user.findUnique({
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
  }

  async updateUser(userId: string, data: Record<string, any>): Promise<any> {
    return this.prisma.user.update({
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
  }

  async findTenantMemberships(organizationId: string): Promise<any[]> {
    return this.prisma.membership.findMany({
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
  }
}
