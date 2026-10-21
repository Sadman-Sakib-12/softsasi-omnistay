import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import { CommissionApplicationService } from '../../application/services/commission.application-service.js';
import { CalculateCommissionDto } from '../dto/commission.dto.js';

@ApiTags('Marketplace - Commissions & Revenue Deductions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/marketplace/commissions')
export class CommissionController {
  constructor(private readonly commissionService: CommissionApplicationService) {}

  @Post('calculate')
  @Roles('SuperAdmin', 'Company Owner/GM', 'Financial Accountant')
  @ApiOperation({ summary: 'Calculate and record commission deduction for vendor booking' })
  calculateCommission(@Body() dto: CalculateCommissionDto) {
    return this.commissionService.calculateAndRecordCommission(dto);
  }

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'List all commission deduction ledgers for a vendor' })
  getVendorCommissions(@Param('vendorId') vendorId: string) {
    return this.commissionService.getCommissionsForVendor(vendorId);
  }
}
