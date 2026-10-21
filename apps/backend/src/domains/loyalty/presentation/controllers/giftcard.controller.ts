import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { GiftCardApplicationService } from '../../application/services/giftcard.application-service.js';
import { IssueGiftCardDto, RedeemGiftCardDto } from '../dto/giftcard.dto.js';

@ApiTags('Loyalty - Digital Gift Cards')
@Controller('api/v1/loyalty/gift-cards')
export class GiftCardController {
  constructor(private readonly giftCardService: GiftCardApplicationService) {}

  @Post('issue')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Issue 16-character alphanumeric digital gift card' })
  issueGiftCard(@Body() dto: IssueGiftCardDto) {
    return this.giftCardService.issueGiftCard(dto);
  }

  @Get('balance/:code')
  @ApiOperation({ summary: 'Check gift card balance and redemption status' })
  checkBalance(@Param('code') code: string) {
    return this.giftCardService.checkBalance(code);
  }

  @Post('redeem')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Redeem gift card balance against stay or invoice' })
  redeemGiftCard(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: RedeemGiftCardDto,
  ) {
    return this.giftCardService.redeemGiftCard(user.userId, dto);
  }
}
