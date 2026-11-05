import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BudgetService } from '../../application/services/budget.service.js';
import {
  CreateDepartmentBudgetDto,
  UpdateDepartmentBudgetDto,
} from '../dto/budget.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Accounting - Budgeting & Forecasting')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/accounting/budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  @ApiOperation({
    summary: 'List Departmental Budgets (Section 7.7)',
    description: 'Retrieves annual and monthly expenditure caps for F&B, Housekeeping, Maintenance, Marketing, and Admin.',
  })
  @ApiQuery({ name: 'fiscalYear', required: false, example: '2026' })
  async listBudgets(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('fiscalYear') fiscalYear?: string,
  ) {
    return this.budgetService.listBudgets(user.organizationId || '', fiscalYear || '2026');
  }

  @Get('variance')
  @ApiOperation({
    summary: 'Live Variance Analysis Dashboard (Section 7.7)',
    description: 'Compares Budgeted vs Actual revenue and expenses in real-time, automatically flagging over-budget variances in red.',
  })
  @ApiQuery({ name: 'fiscalYear', required: false, example: '2026' })
  @ApiQuery({ name: 'month', required: false, example: '10' })
  async getVariance(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('fiscalYear') fiscalYear?: string,
    @Query('month') month?: string,
  ) {
    const monthNum = month ? parseInt(month, 10) : 10;
    return this.budgetService.getVarianceAnalysis(
      user.organizationId || '',
      fiscalYear || '2026',
      monthNum,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new departmental budget allocation' })
  async createBudget(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateDepartmentBudgetDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.budgetService.createDepartmentBudget(user.organizationId || '', dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update departmental budget allocation cap' })
  async updateBudget(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateDepartmentBudgetDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.budgetService.updateDepartmentBudget(user.organizationId || '', id, dto, user);
  }
}

