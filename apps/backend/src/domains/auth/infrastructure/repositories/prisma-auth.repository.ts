import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface.js';

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        memberships: {
          include: {
            organization: true,
            role: true,
          },
        },
      },
    });
  }

  async findUserById(userId: string): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            organization: true,
            role: true,
          },
        },
      },
    });
  }

  async updateUser(userId: string, data: Record<string, any>): Promise<any> {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async createRefreshToken(data: any): Promise<any> {
    return this.prisma.refreshToken.create({ data });
  }

  async findRefreshToken(tokenHash: string): Promise<any | null> {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            memberships: {
              include: { organization: true, role: true },
            },
          },
        },
      },
    });
  }

  async revokeRefreshToken(id: string): Promise<any> {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<any> {
    return this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }
}
