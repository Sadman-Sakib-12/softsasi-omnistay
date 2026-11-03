import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OcrService } from '../../application/services/ocr.service.js';
import { ParsePassportDto } from '../dto/ocr.dto.js';
import { JwtAuthGuard, Public } from '@omnistay/backend-common';

@ApiTags('Guest Identity OCR & MRZ Document Intelligence')
@Controller('api/v1/hotel/ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Public() // Allow front desk kiosk & pre-arrival online check-in portal
  @Post('passport')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Parse Passport / National ID MRZ (Chapter 4.1.5.2 & Chapter 15.1)',
    description: 'Extracts document number, nationality, name, DOB, and expiry date from identity documents using ICAO Doc 9303 MRZ parser or regex heuristics.',
  })
  @ApiResponse({ status: 200, description: 'Parsed identity document fields' })
  async parsePassport(
    @Body(new ValidationPipe({ whitelist: true })) dto: ParsePassportDto,
  ) {
    return this.ocrService.parseDocument(dto);
  }
}

