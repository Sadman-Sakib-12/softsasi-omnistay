import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import { PosMenuApplicationService } from '../../application/services/pos-menu.application-service.js';

@ApiTags('POS - Menus & Catalog Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/pos/menus')
export class PosMenuController {
  constructor(private readonly menuService: PosMenuApplicationService) {}

  @Post(':outletId')
  @Roles('SuperAdmin', 'Company Owner/GM', 'Property General Manager', 'F&B Director', 'Executive Chef')
  @ApiOperation({ summary: 'Create new menu for outlet' })
  createMenu(
    @Param('outletId') outletId: string,
    @Body('menuName') menuName: string,
  ) {
    return this.menuService.createMenu(outletId, menuName);
  }

  @Get('outlet/:outletId')
  @ApiOperation({ summary: 'Get all menus and items for an outlet' })
  getMenusByOutlet(@Param('outletId') outletId: string) {
    return this.menuService.getMenusByOutlet(outletId);
  }

  @Post(':menuId/categories')
  @Roles('SuperAdmin', 'Company Owner/GM', 'Property General Manager', 'F&B Director', 'Executive Chef')
  @ApiOperation({ summary: 'Add category to menu' })
  createCategory(
    @Param('menuId') menuId: string,
    @Body('categoryName') categoryName: string,
    @Body('displayOrder') displayOrder?: number,
  ) {
    return this.menuService.createCategory(menuId, categoryName, displayOrder);
  }

  @Post('categories/:categoryId/items')
  @Roles('SuperAdmin', 'Company Owner/GM', 'Property General Manager', 'F&B Director', 'Executive Chef')
  @ApiOperation({ summary: 'Add menu item with allergens, price, and modifiers' })
  createMenuItem(
    @Param('categoryId') categoryId: string,
    @Body()
    data: {
      itemName: string;
      price: number;
      allergens?: string[];
      isAvailable?: boolean;
      modifiers?: { modifierName: string; priceExtra: number }[];
    },
  ) {
    return this.menuService.createMenuItem(categoryId, data);
  }

  @Patch('items/:itemId/availability')
  @ApiOperation({ summary: 'Toggle menu item 86/available status' })
  toggleItemAvailability(
    @Param('itemId') itemId: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.menuService.toggleItemAvailability(itemId, isAvailable);
  }
}
