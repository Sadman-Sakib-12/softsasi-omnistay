import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CartService } from '../../application/services/cart.service.js';
import { AddToCartDto, CheckoutCartDto, UpdateCartItemDto } from '../dto/cart.dto.js';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Universal Booking Cart & Bundling')
@Controller('api/v1/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':sessionId')
  @ApiOperation({
    summary: 'Get cart summary & dynamic vacation bundle discount',
    description: 'Calculates cross-vertical vacation bundling discounts (e.g., 10% for 2 verticals, 15% for 3+ verticals), taxes, and itemized lines.',
  })
  @ApiParam({ name: 'sessionId', description: 'Session or guest cart identifier' })
  async getCartSummary(@Param('sessionId') sessionId: string) {
    return this.cartService.getCartSummary(sessionId);
  }

  @Post(':sessionId/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add item to cross-vertical cart',
    description: 'Enables adding Hotel, Tour, Car, Space, Boat, Event, or Flight items to a single shopping cart.',
  })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant organization UUID' })
  async addItem(
    @Param('sessionId') sessionId: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: AddToCartDto,
    @Query('tenantId') tenantId?: string,
    @CurrentUser() user?: AuthenticatedUserPayload,
  ) {
    const targetTenantId = tenantId || user?.organizationId || '00000000-0000-0000-0000-000000000000';
    return this.cartService.addItemToCart(sessionId, targetTenantId, dto, user?.userId);
  }

  @Patch(':sessionId/items/:itemId')
  @ApiOperation({ summary: 'Update cart item' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiParam({ name: 'itemId', description: 'Cart Item UUID' })
  async updateItem(
    @Param('sessionId') sessionId: string,
    @Param('itemId') itemId: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(sessionId, itemId, dto);
  }

  @Delete(':sessionId/items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiParam({ name: 'itemId', description: 'Cart Item UUID' })
  async removeItem(
    @Param('sessionId') sessionId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeCartItem(sessionId, itemId);
  }

  @Delete(':sessionId')
  @ApiOperation({ summary: 'Clear cart' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  async clearCart(@Param('sessionId') sessionId: string) {
    return this.cartService.clearCart(sessionId);
  }

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Universal vacation itinerary checkout',
    description: 'One-click checkout converting bundled cart into confirmed vacation reservations with encrypted travel voucher generation.',
  })
  @ApiResponse({ status: 200, description: 'Vacation package confirmed with itinerary and travel voucher' })
  async checkout(
    @Body(new ValidationPipe({ whitelist: true })) dto: CheckoutCartDto,
    @CurrentUser() user?: AuthenticatedUserPayload,
  ) {
    return this.cartService.checkoutCart(dto, user);
  }
}
