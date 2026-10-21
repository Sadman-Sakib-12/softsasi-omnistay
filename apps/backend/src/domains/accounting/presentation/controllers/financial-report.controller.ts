import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FinancialReportService } from '../../application/services/financial-report.service.js';
import { DateRangeQueryDto } from '../dto/financial-reports.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Accounting - Financial Reports')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/accounting/reports')
export class FinancialReportController {
  constructor(private readonly reportService: FinancialReportService) {}

  @Get('pnl')
  @ApiOperation({
    summary: 'Get USALI Profit & Loss Statement (Income Statement)',
    description: 'Computes real-time multi-departmental net room revenue, F&B margin, operating expenses (OPEX), GOP (Gross Operating Profit), and Net Profit.',
  })
  async getPnl(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query() query: DateRangeQueryDto,
  ) {
    return this.reportService.getProfitAndLoss(user.organizationId || '', query);
  }

  @Get('balance-sheet')
  @ApiOperation({
    summary: 'Get Real-Time Balance Sheet',
    description: 'Renders complete financial position: Current & Fixed Assets, Liabilities, and Shareholder Equity (Assets = Liabilities + Equity).',
  })
  async getBalanceSheet(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.reportService.getBalanceSheet(user.organizationId || '');
  }

  @Get('cash-flow')
  @ApiOperation({
    summary: 'Get Cash Flow Statement',
    description: 'Summarizes cash generation and disbursement across Operating, Investing, and Financing activities.',
  })
  async getCashFlow(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.reportService.getCashFlowStatement(user.organizationId || '');
  }
}
