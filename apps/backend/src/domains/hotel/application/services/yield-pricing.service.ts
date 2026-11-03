import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { YieldPricingQueryDto } from '../../presentation/dto/yield-pricing.dto.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

export interface YieldStrategyTier {
  tier: 'ULTRA_PEAK' | 'HIGH_DEMAND' | 'MODERATE_DEMAND' | 'LAST_MINUTE_DISCOUNT' | 'STANDARD_BASE';
  multiplier: number;
  percentageChange: string;
  reason: string;
}

@Injectable()
export class YieldPricingService {
  private readonly logger = new Logger(YieldPricingService.name);

  constructor(private readonly prisma: PrismaService) {}

  private canAccessProperty(
    propertyOrgId: string,
    callerOrgId?: string,
    caller?: AuthenticatedUserPayload,
  ): boolean {
    if (!caller) return false;
    if (caller.isSuperAdmin || caller.role === 'SuperAdmin' || caller.role === 'Platform SuperAdmin') {
      return true;
    }
    return Boolean(callerOrgId && propertyOrgId === callerOrgId);
  }

  /**
   * Real-Time Occupancy-Triggered Yield Pricing Engine (Chapter 4.1.3.5 & 14.3):
   * Calculates live dynamic rate surges and last-minute discounts based on:
   * - Occupancy >= 95%: +50% surge
   * - Occupancy >= 85%: +25% surge
   * - Occupancy >= 70%: +10% surge
   * - Occupancy < 50% & arrival < 48 hours: -15% last-minute discount
   * - Standard: 1.0x base
   */
  async calculateYieldPricing(
    propertyId: string,
    query: YieldPricingQueryDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: propertyId },
      include: {
        roomTypes: {
          where: {
            deletedAt: null,
            ...(query.roomTypeId ? { id: query.roomTypeId } : {}),
          },
          include: {
            rooms: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!hotel) {
      throw new NotFoundException(`Property with ID '${propertyId}' not found`);
    }

    if (!this.canAccessProperty(hotel.organizationId, organizationId, caller)) {
      throw new ForbiddenException('Cross-tenant data access denied');
    }

    const startDate = query.startDate ? new Date(query.startDate) : new Date();
    const endDate = query.endDate ? new Date(query.endDate) : new Date(startDate.getTime() + 86400000 * 2);

    // Total physical room inventory
    let totalRoomsCount = 0;
    for (const rt of hotel.roomTypes) {
      totalRoomsCount += rt.rooms.length > 0 ? rt.rooms.length : 1;
    }
    if (totalRoomsCount === 0) totalRoomsCount = 10; // Fallback baseline

    // Count active overlapping reservations
    const overlappingBookingsCount = await this.prisma.booking.count({
      where: {
        propertyId,
        bookingStatus: { in: ['confirmed', 'checked_in'] },
        checkInDate: { lt: endDate },
        checkOutDate: { gt: startDate },
        deletedAt: null,
      },
    });

    const occupancyRate = Math.min(100, Math.round((overlappingBookingsCount / totalRoomsCount) * 100));

    // Hours to arrival calculation
    const hoursToArrival = (startDate.getTime() - Date.now()) / (1000 * 60 * 60);

    // Evaluate yield tier
    const yieldStrategy = this.evaluateYieldStrategy(occupancyRate, hoursToArrival);

    // Apply dynamic multiplier to each room category
    const dynamicRoomRates = hotel.roomTypes.map((rt: any) => {
      const baseRate = Number(rt.basePrice);
      const dynamicRate = Math.round(baseRate * yieldStrategy.multiplier * 100) / 100;
      const totalInventory = rt.rooms?.length > 0 ? rt.rooms.length : 1;

      return {
        roomTypeId: rt.id,
        roomTypeTitle: rt.title,
        baseRate,
        dynamicRate,
        currency: 'USD',
        yieldMultiplier: yieldStrategy.multiplier,
        surgeAdjustment: yieldStrategy.percentageChange,
        totalInventory,
      };
    });

    return {
      propertyId: hotel.id,
      propertyName: hotel.name,
      currency: 'USD',
      evaluationPeriod: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        hoursUntilArrival: Math.max(0, Math.round(hoursToArrival)),
      },
      occupancyMetrics: {
        totalRoomsInventory: totalRoomsCount,
        occupiedRooms: overlappingBookingsCount,
        occupancyPercentage: `${occupancyRate}%`,
      },
      yieldStrategy,
      dynamicRoomRates,
    };
  }

  /**
   * Returns strategic recommendations for revenue management.
   */
  async getYieldRecommendations(
    propertyId: string,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    const todayYield = await this.calculateYieldPricing(propertyId, {}, organizationId, caller);

    return {
      propertyId,
      propertyName: todayYield.propertyName,
      currentStrategy: todayYield.yieldStrategy,
      occupancy: todayYield.occupancyMetrics.occupancyPercentage,
      recommendations: [
        {
          target: 'Weekend Surge Rule',
          action: 'Apply +20% automatic modifier for Friday and Saturday reservations.',
          projectedRevParIncrease: '+14.5%',
        },
        {
          target: 'Minimum Length of Stay (MLOS)',
          action: todayYield.occupancyMetrics.occupiedRooms > 5
            ? 'High demand detected: Enforce 2-night minimum stay restriction.'
            : 'Maintain standard 1-night minimum stay.',
          status: 'Active',
        },
        {
          target: 'Early Bird Incentive',
          action: 'Offer -10% for reservations placed 30+ days in advance with non-refundable rate plan.',
          status: 'Recommended',
        },
      ],
    };
  }

  private evaluateYieldStrategy(occupancyRate: number, hoursToArrival: number): YieldStrategyTier {
    if (occupancyRate >= 95) {
      return {
        tier: 'ULTRA_PEAK',
        multiplier: 1.5,
        percentageChange: '+50%',
        reason: 'Occupancy is 95%+ (Ultra Peak Demand). Maximum yield rate surge applied.',
      };
    }

    if (occupancyRate >= 85) {
      return {
        tier: 'HIGH_DEMAND',
        multiplier: 1.25,
        percentageChange: '+25%',
        reason: 'Occupancy is 85%+ (High Demand). Yield rate surge applied.',
      };
    }

    if (occupancyRate >= 70) {
      return {
        tier: 'MODERATE_DEMAND',
        multiplier: 1.1,
        percentageChange: '+10%',
        reason: 'Occupancy is 70%+ (Moderate Demand). Standard rate surge applied.',
      };
    }

    if (occupancyRate < 50 && hoursToArrival <= 48 && hoursToArrival >= 0) {
      return {
        tier: 'LAST_MINUTE_DISCOUNT',
        multiplier: 0.85,
        percentageChange: '-15%',
        reason: 'Occupancy under 50% with arrival under 48 hours. Last-minute flash sale discount applied to liquidate remaining inventory.',
      };
    }

    return {
      tier: 'STANDARD_BASE',
      multiplier: 1.0,
      percentageChange: '0%',
      reason: 'Occupancy is within standard baseline threshold. Standard rack rates applied.',
    };
  }
}

