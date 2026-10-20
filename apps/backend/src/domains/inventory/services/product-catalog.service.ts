import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CreateProductDto } from '../dto/product.dto.js';

@Injectable()
export class ProductCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  generateBarcode(sku: string): string {
    // Generate valid 13-digit EAN-13 style barcode string
    const cleanNum = sku.replace(/\D/g, '').padEnd(12, '7').slice(0, 12);
    // Calculate simple check digit
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanNum[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return `${cleanNum}${checkDigit}`;
  }

  async createProduct(tenantId: string, dto: CreateProductDto) {
    const existing = await this.prisma.product.findFirst({
      where: { tenantId, sku: dto.sku },
    });
    if (existing) {
      throw new ConflictException(`Product with SKU ${dto.sku} already exists`);
    }

    const barcode = dto.barcode || this.generateBarcode(dto.sku);

    const product = await this.prisma.product.create({
      data: {
        tenantId,
        name: dto.name,
        sku: dto.sku,
        barcode,
        categoryId: dto.categoryId,
        unitId: dto.unitId,
        costPrice: dto.costPrice,
        retailPrice: dto.retailPrice || dto.costPrice * 1.5,
        isRecipe: dto.isRecipe || false,
      },
    });

    // Create Barcode record
    await this.prisma.productBarcode.create({
      data: {
        productId: product.id,
        barcode,
        barcodeType: 'EAN13',
      },
    });

    // If recipe ingredients specified, create Recipe BOM
    if (dto.isRecipe && dto.recipeIngredients && dto.recipeIngredients.length > 0) {
      const recipe = await this.prisma.productRecipe.create({
        data: {
          recipeName: `${dto.name} Recipe`,
          yieldServings: 1,
        },
      });

      for (const ing of dto.recipeIngredients) {
        await this.prisma.productRecipeItem.create({
          data: {
            recipeId: recipe.id,
            productId: ing.productId,
            quantity: ing.quantity,
          },
        });
      }
    }

    return this.getProductById(product.id);
  }

  async getProducts(tenantId: string) {
    return this.prisma.product.findMany({
      where: { tenantId },
      include: {
        category: true,
        unit: true,
        barcodes: true,
        recipeItems: {
          include: { product: true },
        },
        warehouseProducts: {
          include: { warehouse: true },
        },
      },
    });
  }

  async getProductById(productId: string) {
    const p = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        unit: true,
        barcodes: true,
        recipeItems: {
          include: { product: true },
        },
        warehouseProducts: {
          include: { warehouse: true },
        },
      },
    });
    if (!p) throw new NotFoundException(`Product ${productId} not found`);
    return p;
  }
}
