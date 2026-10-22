import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { InChatBookingService } from '../../application/services/in-chat-booking.service.js';

@ApiTags('AI - Conversational In-Chat Booking & Checkout')
@Controller('api/v1/ai/in-chat')
export class InChatBookingController {
  constructor(private readonly inChatBookingService: InChatBookingService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  @ApiOperation({ summary: 'Initiate frictionless in-chat room checkout directly within conversation' })
  initiateBooking(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() body: {
      conversationId: string;
      propertyId: string;
      roomTypeId: string;
      checkInDate: string;
      checkOutDate: string;
      adults: number;
      children?: number;
      paymentMethod?: string;
    },
  ) {
    return this.inChatBookingService.initiateInChatBooking({
      tenantId: user.organizationId || '00000000-0000-0000-0000-000000000001',
      guestId: user.userId,
      ...body,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('confirm/:transactionId')
  @ApiOperation({ summary: 'Confirm in-chat payment execution and finalize reservation' })
  confirmPayment(@Param('transactionId') transactionId: string) {
    return this.inChatBookingService.confirmInChatPayment(transactionId);
  }
}
