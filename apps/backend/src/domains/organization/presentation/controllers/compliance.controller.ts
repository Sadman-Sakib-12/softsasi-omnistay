import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Public } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { ComplianceService } from '../../application/services/compliance.service.js';
import { CookieConsentDto } from '../dto/saas-plan.dto.js';

@ApiTags('Enterprise Compliance & Data Privacy (GDPR, CCPA, PCI-DSS - Chapter 19.5)')
@Controller('api/v1/compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Public()
  @Post('cookie-consent')
  @ApiOperation({
    summary: 'Record visitor cookie consent preferences (GDPR / ePrivacy Directive)',
    description: 'Stores visitor cookie preferences (necessary, analytics, marketing) alongside IP and user agent.',
  })
  recordCookieConsent(
    @Ip() ip: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: CookieConsentDto,
  ) {
    return this.complianceService.recordCookieConsent(ip, dto);
  }

  @Public()
  @Get('cookie-consent')
  @ApiOperation({ summary: 'Retrieve visitor cookie consent status' })
  getCookieConsent(@Ip() ip: string) {
    return this.complianceService.getCookieConsent(ip);
  }

  @Post('anonymize/:userId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Right-to-be-Forgotten: Purge & anonymize personal data (GDPR Article 17 / CCPA)',
    description: 'Cryptographically obfuscates and purges guest PII (name, email, phone, documents) while preserving financial ledger integrity.',
  })
  anonymizeUser(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.complianceService.anonymizeUserData(userId, user.userId);
  }

  @Get('export/:userId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Guest Data Portability Export (GDPR Article 20 / CCPA)',
    description: 'Generates a structured, machine-readable JSON package of all personal dossiers, reservations, folios, and documents.',
  })
  exportUserData(@Param('userId') userId: string) {
    return this.complianceService.exportUserData(userId);
  }
}
