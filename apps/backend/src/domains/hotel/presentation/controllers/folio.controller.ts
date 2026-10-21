import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FolioService } from '../../application/services/folio.service.js';
import { AddFolioChargeDto, AddFolioPaymentDto } from '../dto/folio.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Guest Folios & Billing Transactions')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/folios')
export class FolioController {
  constructor(private readonly folioService: FolioService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get guest folio ledger',
    description: 'Retrieves itemized billing folio including room rates, restaurant POS orders, spa charges, and payments.',
  })
  @ApiParam({ name: 'id', description: 'GuestFolio UUID' })
  @ApiResponse({ status: 200, description: 'Folio ledger' })
  @ApiResponse({ status: 404, description: 'Folio not found' })
  async getFolio(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.folioService.getFolioById(id, user.organizationId);
  }

  @Post(':id/charges')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Post itemized charge to folio',
    description: 'Posts dining, spa, minibar, or laundry charges directly to guest room folio with department categorization.',
  })
  @ApiParam({ name: 'id', description: 'GuestFolio UUID' })
  @ApiResponse({ status: 201, description: 'Charge posted successfully' })
  async addCharge(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: AddFolioChargeDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.folioService.addCharge(id, dto, user.organizationId || '', user);
  }

  @Post(':id/payments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Post payment to folio',
    description: 'Credits a cash, credit card, or digital wallet payment towards the outstanding folio balance.',
  })
  @ApiParam({ name: 'id', description: 'GuestFolio UUID' })
  @ApiResponse({ status: 200, description: 'Payment recorded and balance updated' })
  async addPayment(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: AddFolioPaymentDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.folioService.addPayment(id, dto, user.organizationId || '', user);
  }
}
