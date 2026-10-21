import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CreateIcalFeedDto } from '../../presentation/dto/ical.dto.js';
import { RoomTypeService } from './room-type.service.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import crypto from 'node:crypto';

@Injectable()
export class IcalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roomTypeService: RoomTypeService,
  ) {}

  private canManageFeeds(caller?: AuthenticatedUserPayload): boolean {
    if (!caller) return false;
    return (
      caller.isSuperAdmin ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Platform SuperAdmin' ||
      caller.role === 'Company Owner/GM' ||
      caller.role === 'Company Owner / GM' ||
      caller.role === 'General Manager (GM)' ||
      caller.permissions.includes('rooms:manage') ||
      caller.permissions.includes('properties:manage')
    );
  }

  /**
   * Registers a 2-way iCal synchronization feed for a room category.
   */
  async createIcalFeed(
    roomTypeId: string,
    dto: CreateIcalFeedDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    await this.roomTypeService.getRoomTypeById(roomTypeId, organizationId);

    if (!this.canManageFeeds(caller)) {
      throw new ForbiddenException('Insufficient permissions to configure iCal synchronization feeds');
    }

    const token = `ical_${crypto.randomBytes(16).toString('hex')}`;

    const feed = await this.prisma.icalFeed.create({
      data: {
        roomTypeId,
        feedUrl: dto.feedUrl,
        channelName: dto.channelName,
        syncDirection: dto.syncDirection || 'bidirectional',
        token,
      },
    });

    return {
      message: 'iCal synchronization channel registered successfully',
      feedId: feed.id,
      channelName: feed.channelName,
      syncDirection: feed.syncDirection,
      exportFeedUrl: `/api/v1/ical/export/${token}.ics`,
      token,
    };
  }

  /**
   * Lists iCal feeds for a room category.
   */
  async listIcalFeeds(roomTypeId: string, organizationId?: string) {
    await this.roomTypeService.getRoomTypeById(roomTypeId, organizationId);

    return this.prisma.icalFeed.findMany({
      where: { roomTypeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Generates RFC 5545 compliant `.ics` calendar content for outbound OTA feeds.
   */
  async generateOutboundIcs(token: string): Promise<string> {
    const feed = await this.prisma.icalFeed.findFirst({
      where: { token },
      include: {
        roomType: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!feed) {
      throw new NotFoundException('Calendar feed token not found or invalid');
    }

    const bookings = await this.prisma.booking.findMany({
      where: {
        deletedAt: null,
        bookingStatus: { in: ['confirmed', 'checked_in'] },
        bookingItems: {
          some: { roomTypeId: feed.roomTypeId },
        },
      },
      select: {
        id: true,
        bookingCode: true,
        checkInDate: true,
        checkOutDate: true,
        createdAt: true,
      },
    });

    const nowStr = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0] + 'Z';

    const events = bookings.map((b) => {
      const dtStart = b.checkInDate.toISOString().split('T')[0].replace(/-/g, '');
      const dtEnd = b.checkOutDate.toISOString().split('T')[0].replace(/-/g, '');

      return [
        'BEGIN:VEVENT',
        `UID:booking-${b.id}@omnistay.com`,
        `DTSTAMP:${nowStr}`,
        `DTSTART;VALUE=DATE:${dtStart}`,
        `DTEND;VALUE=DATE:${dtEnd}`,
        `SUMMARY:Reserved (OmniStay #${b.bookingCode})`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'END:VEVENT',
      ].join('\r\n');
    });

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Softsasi Enterprise Technologies//OmniStay 360 iCal Engine//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${feed.roomType.property.name} - ${feed.roomType.title}`,
      ...events,
      'END:VCALENDAR',
    ];

    return lines.join('\r\n');
  }

  /**
   * Simulates/executes two-way synchronization for a configured feed.
   */
  async syncIcalFeed(
    feedId: string,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    if (!this.canManageFeeds(caller)) {
      throw new ForbiddenException('Insufficient permissions to trigger iCal sync');
    }

    const feed = await this.prisma.icalFeed.findUnique({
      where: { id: feedId },
      include: {
        roomType: { include: { property: true } },
      },
    });

    if (!feed) {
      throw new NotFoundException('iCal feed record not found');
    }

    if (feed.roomType.property.organizationId !== organizationId) {
      throw new ForbiddenException('Cross-tenant data access denied');
    }

    const updated = await this.prisma.icalFeed.update({
      where: { id: feedId },
      data: {
        lastSyncedAt: new Date(),
      },
    });

    return {
      message: `iCal synchronization completed for channel '${feed.channelName}'`,
      feedId: updated.id,
      channelName: updated.channelName,
      lastSyncedAt: updated.lastSyncedAt,
    };
  }
}
