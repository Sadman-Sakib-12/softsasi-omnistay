import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  INVENTORY_REPOSITORY_TOKEN,
  type IInventoryRepository,
} from '../../domain/repositories/inventory.repository.interface.js';
import { generateEan13Barcode } from '../../domain/rules/inventory.rule.js';
import type { CreateProductDto } from '../../presentation/dto/product.dto.js';

@Injectable()
export class ProductCatalogApplicationService {
  constructor(
    @Inject(INVENTORY_REPOSITORY_TOKEN)
    private readonly repo: IInventoryRepository,
  ) {}

  generateBarcode(sku: string): string {
    return generateEan13Barcode(sku);
  }

  async createProduct(tenantId: string, dto: CreateProductDto) {
    const existing = await this.repo.findProductBySku(tenantId, dto.sku);
    if (existing) {
      throw new ConflictException(`Product with SKU ${dto.sku} already exists`);
    }

    const barcode = dto.barcode || this.generateBarcode(dto.sku);

    const product = await this.repo.createProduct({
      tenantId,
      name: dto.name,
      sku: dto.sku,
      barcode,
      categoryId: dto.categoryId,
      unitId: dto.unitId,
      costPrice: dto.costPrice,
      retailPrice: dto.retailPrice || dto.costPrice * 1.5,
      isRecipe: dto.isRecipe || false,
    });

    await this.repo.createProductBarcode({
      productId: product.id,
      barcode,
      barcodeType: 'EAN13',
    });

    if (dto.isRecipe && dto.recipeIngredients && dto.recipeIngredients.length > 0) {
      const recipe = await this.repo.createProductRecipe({
        recipeName: `${dto.name} Recipe`,
        yieldServings: 1,
      });

      for (const ing of dto.recipeIngredients) {
        await this.repo.createProductRecipeItem({
          recipeId: recipe.id,
          productId: ing.productId,
          quantity: ing.quantity,
        });
      }
    }

    return this.getProductById(product.id);
  }

  async getProducts(tenantId: string) {
    return this.repo.findProducts(tenantId);
  }

  async getProductById(productId: string) {
    const p = await this.repo.findProductById(productId);
    if (!p) throw new NotFoundException(`Product ${productId} not found`);
    return p;
  }
}
