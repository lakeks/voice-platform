import { Controller, Get } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
  ) {}

  @Get('products')
  async getProducts() {
    return await this.catalogService.getProducts();
  }

  @Get('brands')
  async getBrands() {
    return await this.catalogService.getBrands();
  }
}
