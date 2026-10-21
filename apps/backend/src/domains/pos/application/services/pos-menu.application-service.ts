import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  POS_REPOSITORY_TOKEN,
  type IPosRepository,
} from '../../domain/repositories/pos.repository.interface.js';

@Injectable()
export class PosMenuApplicationService {
  constructor(
    @Inject(POS_REPOSITORY_TOKEN)
    private readonly repo: IPosRepository,
  ) {}

  async createMenu(outletId: string, menuName: string) {
    return this.repo.createMenu({
      outletId,
      menuName,
      isActive: true,
    });
  }

  async getMenusByOutlet(outletId: string) {
    return this.repo.findMenusByOutlet(outletId);
  }

  async createCategory(menuId: string, categoryName: string, displayOrder = 0) {
    return this.repo.createCategory({
      menuId,
      categoryName,
      displayOrder,
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
    return this.repo.createMenuItem({
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
    });
  }

  async toggleItemAvailability(itemId: string, isAvailable: boolean) {
    const item = await this.repo.findMenuItemById(itemId);
    if (!item) throw new NotFoundException('Menu item not found');

    return this.repo.updateMenuItem(itemId, { isAvailable });
  }
}
