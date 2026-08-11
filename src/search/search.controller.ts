import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
  ) {}

  @Get()
  async search(
    @Query('product') product?: string,
    @Query('brand') brand?: string,
  ) {
    return await this.searchService.search({
      product,
      brand,
    });
  }
}
