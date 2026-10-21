import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
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
import { JournalService } from '../../application/services/journal.service.js';
import { CreateJournalEntryDto } from '../dto/journal.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Accounting - General Ledger')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/accounting/journals')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  @ApiOperation({ summary: 'List General Ledger journal entries' })
  async listEntries(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.journalService.listJournalEntries(user.organizationId || '');
  }

  @Get('trial-balance')
  @ApiOperation({
    summary: 'Get real-time Trial Balance snapshot',
    description: 'Computes cumulative debits and credits across all accounts. Ensures Debits equal Credits (variance reconciles to 0.00).',
  })
  async getTrialBalance(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.journalService.getTrialBalance(user.organizationId || '');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journal entry by ID' })
  @ApiParam({ name: 'id', description: 'Journal Entry UUID' })
  async getEntry(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.journalService.getJournalEntryById(id, user.organizationId || '');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create double-entry journal entry',
    description: 'Enforces immutable double-entry integrity where Sum of Debits must strictly equal Sum of Credits.',
  })
  async createEntry(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateJournalEntryDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.journalService.createJournalEntry(user.organizationId || '', dto, user);
  }
}
