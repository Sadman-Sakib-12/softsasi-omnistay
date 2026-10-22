import { Body, Controller, Post } from '@nestjs/common';
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
}
