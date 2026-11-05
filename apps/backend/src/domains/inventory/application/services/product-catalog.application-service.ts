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
    let list = await this.repo.findProducts(tenantId);
    if (!list || list.length === 0) {
      await this.seedDefaultProducts(tenantId);
      list = await this.repo.findProducts(tenantId);
    }
    return list;
  }

  private async seedDefaultProducts(tenantId: string) {
    const warehouses = await this.repo.findWarehouses(tenantId);
    const centralWh = warehouses.find((w: any) => w.code === 'WH-CRW-01') || warehouses[0];
    const kitchenWh = warehouses.find((w: any) => w.code === 'WH-KCS-02');
    const cellarWh = warehouses.find((w: any) => w.code === 'WH-BWC-03');
    const linenWh = warehouses.find((w: any) => w.code === 'WH-HLC-04');

    const defaults = [
      {
        name: 'Egyptian Cotton Plush Bath Towels (650 GSM)',
        sku: 'LIN-TOW-001',
        barcode: '5901234120015',
        costPrice: 14.5,
        retailPrice: 24.0,
        stock: 480,
        targetWhId: linenWh ? linenWh.id : centralWh?.id,
      },
      {
        name: 'Artisan Sandalwood Shampoo 50ml (Eco-Bottles)',
        sku: 'AMN-SHM-002',
        barcode: '5901234120022',
        costPrice: 1.85,
        retailPrice: 4.5,
        stock: 1200,
        targetWhId: centralWh?.id,
      },
      {
        name: 'Reserve Cabernet Sauvignon Vintage 2018',
        sku: 'BEV-WIN-003',
        barcode: '5901234120039',
        costPrice: 28.0,
        retailPrice: 85.0,
        stock: 180,
        targetWhId: cellarWh ? cellarWh.id : centralWh?.id,
      },
      {
        name: 'Prime Angus Beef Tenderloin (A5 Grade)',
        sku: 'KIT-MEAT-004',
        barcode: '5901234120046',
        costPrice: 42.0,
        retailPrice: 98.0,
        stock: 65,
        targetWhId: kitchenWh ? kitchenWh.id : centralWh?.id,
      },
      {
        name: 'LED Architectural Downlight 12W 3000K',
        sku: 'ENG-SPARE-005',
        barcode: '5901234120053',
        costPrice: 8.5,
        retailPrice: 18.0,
        stock: 120,
        targetWhId: centralWh?.id,
      },
    ];

    for (const d of defaults) {
      try {
        const prod = await this.repo.createProduct({
          tenantId,
          name: d.name,
          sku: d.sku,
          barcode: d.barcode,
          costPrice: d.costPrice,
          retailPrice: d.retailPrice,
          isRecipe: false,
        });

        await this.repo.createProductBarcode({
          productId: prod.id,
          barcode: d.barcode,
          barcodeType: 'EAN13',
        });

        if (d.targetWhId) {
          await this.repo.upsertWarehouseProduct(d.targetWhId, prod.id, d.stock);
        }
      } catch {
        // Skip duplicate SKU
      }
    }
  }

  async getProductById(productId: string) {
    const p = await this.repo.findProductById(productId);
    if (!p) throw new NotFoundException(`Product ${productId} not found`);
    return p;
  }
}
