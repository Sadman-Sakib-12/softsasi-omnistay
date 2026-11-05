import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContactlessCheckInService } from '../../application/services/contactless-checkin.service.js';
import { ContactlessSelfCheckInDto, PassportOcrRequestDto } from '../dto/iot.dto.js';

@ApiTags('IoT - Contactless Self Check-in & Passport OCR')
@Controller('api/v1/iot/contactless')
export class ContactlessController {
  constructor(private readonly checkInService: ContactlessCheckInService) {}

  @Post('passport-ocr')
  @ApiOperation({ summary: 'Extract and verify passenger passport / national ID details via OCR scanning' })
  parsePassportOcr(@Body() dto: PassportOcrRequestDto) {
    return this.checkInService.parsePassportOcr(dto);
  }

  @Post('self-checkin')
  @ApiOperation({ summary: 'Complete web mobile self check-in, sign terms digitally, and receive mobile key' })
  processSelfCheckIn(@Body() dto: ContactlessSelfCheckInDto) {
    return this.checkInService.processSelfCheckIn(dto);
  }

  @Get('pre-arrival-queue')
  @ApiOperation({ summary: 'List 24-hour pre-arrival notifications and express check-in link statuses' })
  getPreArrivalQueue() {
    return this.checkInService.getPreArrivalQueue();
  }

  @Post('send-notification')
  @ApiOperation({ summary: 'Dispatch 24-hour pre-arrival notification via WhatsApp / Email' })
  sendNotification(@Body() body: { bookingId: string; channel?: string }) {
    return this.checkInService.sendPreArrivalNotification(body.bookingId, body.channel || 'WhatsApp & Email');
  }
}
