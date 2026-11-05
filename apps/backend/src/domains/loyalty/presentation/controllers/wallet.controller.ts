import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { WalletApplicationService } from '../../application/services/wallet.application-service.js';
import { DebitWalletDto, RefundToWalletDto, TopUpWalletDto } from '../dto/wallet.dto.js';

@ApiTags('Loyalty - Pre-Paid Digital Wallet')
@Controller('api/v1/loyalty/wallets')
export class WalletController {
  constructor(private readonly walletService: WalletApplicationService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get enterprise overview summary of pre-paid digital wallets' })
  getSummary() {
    return this.walletService.getSummary();
  }

  @Get('all')
  @ApiOperation({ summary: 'List all customer multi-currency digital wallets and activity' })
  getAllWallets() {
    return this.walletService.getAllWallets();
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user digital wallet balance and recent activity' })
  getMyWallet(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.walletService.getOrCreateWallet(user.userId);
  }

  @Post('top-up')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Top-up wallet balance with promotional bonus credits' })
  topUp(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: TopUpWalletDto,
  ) {
    return this.walletService.topUp(user.userId, dto);
  }

  @Post('debit')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Execute instant 1-click booking checkout from wallet balance' })
  debit(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: DebitWalletDto,
  ) {
    return this.walletService.debit(user.userId, dto);
  }

  @Post('refund')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Instant cancellation refund credited to digital wallet (<1s)' })
  refund(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: RefundToWalletDto,
  ) {
    return this.walletService.refund(user.userId, dto);
  }
}
