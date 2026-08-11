import { Injectable } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class CatalogService {
  constructor(
    private readonly inventoryService: InventoryService,
  ) {}

  async getProducts(): Promise<string[]> {
    const items = await this.inventoryService.findAll();

    const products = items.map(item =>
      item.productType.toLowerCase(),
    );

    return [...new Set(products)];
  }

  async getBrands(): Promise<string[]> {
    const items = await this.inventoryService.findAll();

    const brands = items
      .filter(item => item.brand)
      .map(item => item.brand!.toLowerCase());

    return [...new Set(brands)];
  }
}
