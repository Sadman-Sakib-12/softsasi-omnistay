import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import { VendorPayoutApplicationService } from '../../application/services/vendor-payout.application-service.js';
import {
  AddPayoutMethodDto,
  ProcessPayoutDto,
  RequestWithdrawalDto,
} from '../dto/payout.dto.js';

@ApiTags('Marketplace - Vendor Payouts & Disbursements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/marketplace/payouts')
export class VendorPayoutController {
  constructor(private readonly payoutService: VendorPayoutApplicationService) {}

  @Post('methods/:vendorId')
  @ApiOperation({ summary: 'Register disbursement method (Stripe Connect, PayPal, Bank Wire)' })
  addPayoutMethod(
    @Param('vendorId') vendorId: string,
    @Body() dto: AddPayoutMethodDto,
  ) {
    return this.payoutService.addPayoutMethod(vendorId, dto);
  }

  @Get('methods/:vendorId')
  @ApiOperation({ summary: 'List disbursement methods for vendor' })
  getPayoutMethods(@Param('vendorId') vendorId: string) {
    return this.payoutService.getPayoutMethods(vendorId);
  }

  @Post('withdraw/:vendorId')
  @ApiOperation({ summary: 'Request earnings withdrawal (minimum $100)' })
  requestWithdrawal(
    @Param('vendorId') vendorId: string,
    @Body() dto: RequestWithdrawalDto,
  ) {
    return this.payoutService.requestWithdrawal(vendorId, dto);
  }

  @Get('withdrawals/:vendorId')
  @ApiOperation({ summary: 'List withdrawal requests for vendor' })
  getWithdrawals(@Param('vendorId') vendorId: string) {
    return this.payoutService.getWithdrawals(vendorId);
  }

  @Post('process')
  @Roles('SuperAdmin', 'Financial Accountant')
  @ApiOperation({ summary: 'Approve and execute disbursement payout' })
  processPayout(@Body() dto: ProcessPayoutDto) {
    return this.payoutService.processPayout(dto);
  }

  @Get('history/:vendorId')
  @ApiOperation({ summary: 'List disbursement payout history for vendor' })
  getPayouts(@Param('vendorId') vendorId: string) {
    return this.payoutService.getPayouts(vendorId);
  }
}
