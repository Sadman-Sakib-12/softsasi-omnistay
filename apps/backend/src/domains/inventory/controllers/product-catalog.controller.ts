import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { ProductCatalogService } from '../services/product-catalog.service.js';
import { CreateProductDto } from '../dto/product.dto.js';

@ApiTags('Supply Chain - Product Master Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/inventory/products')
export class ProductCatalogController {
  constructor(private readonly catalogService: ProductCatalogService) {}

  @Post()
  @Roles('SuperAdmin', 'Company Owner/GM', 'Property General Manager', 'F&B Director', 'Purchasing Manager')
  @ApiOperation({ summary: 'Create new product with auto-generated barcode and Recipe BOM' })
  createProduct(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreateProductDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.catalogService.createProduct(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all products across all categories and recipes' })
  getProducts(@CurrentUser() user: AuthenticatedUserPayload) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.catalogService.getProducts(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details, recipe ingredients, and warehouse stocks' })
  getProductById(@Param('id') id: string) {
    return this.catalogService.getProductById(id);
  }
}
