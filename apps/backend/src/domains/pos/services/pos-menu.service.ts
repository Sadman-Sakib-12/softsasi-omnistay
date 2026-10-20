import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';

@Injectable()
export class PosMenuService {
  constructor(private readonly prisma: PrismaService) {}

  async createMenu(outletId: string, menuName: string) {
    return this.prisma.posMenu.create({
      data: {
        outletId,
        menuName,
        isActive: true,
      },
    });
  }

  async getMenusByOutlet(outletId: string) {
    return this.prisma.posMenu.findMany({
      where: { outletId },
      include: {
        categories: {
          orderBy: { displayOrder: 'asc' },
          include: {
            items: {
              include: { modifiers: true },
            },
          },
        },
      },
    });
  }

  async createCategory(menuId: string, categoryName: string, displayOrder = 0) {
    return this.prisma.posMenuCategory.create({
      data: {
        menuId,
        categoryName,
        displayOrder,
      },
    });
  }

  async createMenuItem(
    categoryId: string,
    data: {
      itemName: string;
      price: number;
      allergens?: string[];
      isAvailable?: boolean;
      modifiers?: { modifierName: string; priceExtra: number }[];
    },
  ) {
    return this.prisma.posMenuItem.create({
      data: {
        categoryId,
        itemName: data.itemName,
        price: data.price,
        allergens: data.allergens || [],
        isAvailable: data.isAvailable ?? true,
        modifiers: data.modifiers
          ? {
              create: data.modifiers.map((m) => ({
                modifierName: m.modifierName,
                priceExtra: m.priceExtra,
              })),
            }
          : undefined,
      },
      include: {
        modifiers: true,
      },
    });
  }

  async toggleItemAvailability(itemId: string, isAvailable: boolean) {
    const item = await this.prisma.posMenuItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Menu item not found');

    return this.prisma.posMenuItem.update({
      where: { id: itemId },
      data: { isAvailable },
    });
  }
}
