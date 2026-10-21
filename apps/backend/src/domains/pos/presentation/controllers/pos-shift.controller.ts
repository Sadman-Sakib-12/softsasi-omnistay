import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import { PosShiftApplicationService } from '../../application/services/pos-shift.application-service.js';
import { CloseCashierShiftDto, OpenCashierShiftDto, RecordCashDropDto } from '../dto/pos-shift.dto.js';

@ApiTags('POS - Cashier Shifts & X/Z Balancing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/pos/shifts')
export class PosShiftController {
  constructor(private readonly shiftService: PosShiftApplicationService) {}

  @Post('open')
  @ApiOperation({ summary: 'Open new cashier shift with starting cash float ($500)' })
  openShift(@Body() dto: OpenCashierShiftDto) {
    return this.shiftService.openShift(dto);
  }

  @Post(':shiftId/cash-drop')
  @ApiOperation({ summary: 'Record mid-day cash drop to safe' })
  recordCashDrop(
    @Param('shiftId') shiftId: string,
    @Body() dto: RecordCashDropDto,
  ) {
    return this.shiftService.recordCashDrop(shiftId, dto);
  }

  @Get(':shiftId/x-report')
  @ApiOperation({ summary: 'Generate X-Report (mid-shift audit snapshot of sales and drawer)' })
  generateXReport(@Param('shiftId') shiftId: string) {
    return this.shiftService.generateXReport(shiftId);
  }

  @Post(':shiftId/close-z-report')
  @Roles('SuperAdmin', 'Company Owner/GM', 'Property General Manager', 'F&B Director', 'Cashier', 'Restaurant Captain')
  @ApiOperation({ summary: 'Close shift & generate permanent Z-Report with cash over/short calculation' })
  closeShiftAndGenerateZReport(
    @Param('shiftId') shiftId: string,
    @Body() dto: CloseCashierShiftDto,
  ) {
    return this.shiftService.closeShiftAndGenerateZReport(shiftId, dto);
  }
}
