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
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChartOfAccountsService } from '../../application/services/coa.service.js';
import { CreateAccountDto, UpdateAccountDto } from '../dto/coa.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Accounting - Chart of Accounts')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/accounting/coa')
export class ChartOfAccountsController {
  constructor(private readonly coaService: ChartOfAccountsService) {}

  @Get()
  @ApiOperation({
    summary: 'List Chart of Accounts (USALI Standard)',
    description: 'Retrieves multi-level accounts tree conforming to Uniform System of Accounts for the Lodging Industry (USALI).',
  })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by account type: asset, liability, equity, revenue, expense' })
  async listAccounts(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('type') type?: string,
  ) {
    return this.coaService.listAccounts(user.organizationId || '', type);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get account by USALI code' })
  @ApiParam({ name: 'code', example: '1010' })
  async getAccount(
    @Param('code') code: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.coaService.getAccountByCode(user.organizationId || '', code);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create custom ledger account' })
  async createAccount(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateAccountDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.coaService.createAccount(user.organizationId || '', dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update account details' })
  async updateAccount(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateAccountDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.coaService.updateAccount(id, user.organizationId || '', dto, user);
  }
}
