import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { GuestReviewApplicationService } from '../../application/services/guest-review.application-service.js';
import { CreateGuestReviewDto, ReplyReviewDto } from '../dto/review.dto.js';

@ApiTags('Marketplace - Guest Reviews & Reputation')
@Controller('api/v1/marketplace/reviews')
export class GuestReviewController {
  constructor(private readonly reviewService: GuestReviewApplicationService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit 5-star multi-criteria guest review for verified stay' })
  createReview(@Body() dto: CreateGuestReviewDto) {
    return this.reviewService.createReview(dto);
  }

  @Post(':id/reply')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Host public reply to guest review' })
  replyReview(@Param('id') id: string, @Body() dto: ReplyReviewDto) {
    return this.reviewService.replyToReview(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID with dimension breakdown and host reply' })
  getReviewById(@Param('id') id: string) {
    return this.reviewService.getReviewById(id);
  }

  @Get()
  @ApiOperation({ summary: 'List reviews for specific bookings' })
  getReviews(@Query('bookingIds') bookingIds: string) {
    const ids = bookingIds ? bookingIds.split(',') : [];
    return this.reviewService.getReviewsForBookings(ids);
  }
}
