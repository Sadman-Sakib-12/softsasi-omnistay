import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { PosOrderApplicationService } from '../../application/services/pos-order.application-service.js';
import { CreatePosOrderDto, SettlePosOrderDto, SplitCheckDto } from '../dto/pos-order.dto.js';

@ApiTags('POS - Orders & Checkout')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/pos/orders')
export class PosOrderController {
  constructor(private readonly orderService: PosOrderApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Ring up new POS order with course items and service charges' })
  createOrder(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreatePosOrderDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.orderService.createOrder(tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details, items, payments, and KDS tickets' })
  getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Post(':id/settle')
  @ApiOperation({ summary: 'Settle order with cash, card, room charge, or digital wallet' })
  settleOrder(
    @Param('id') id: string,
    @Body() dto: SettlePosOrderDto,
  ) {
    return this.orderService.settleOrder(id, dto);
  }

  @Post(':id/split')
  @ApiOperation({ summary: 'Split dining check evenly across guests' })
  splitCheck(
    @Param('id') id: string,
    @Body() dto: SplitCheckDto,
  ) {
    return this.orderService.splitCheck(id, dto);
  }
}
