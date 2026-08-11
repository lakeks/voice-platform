import { Injectable } from '@nestjs/common';
import { CatalogService } from '../catalog/catalog.service';
import { VehicleService } from '../vehicle/vehicle.service';
import { SearchService } from '../search/search.service';

@Injectable()
export class ParserService {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly vehicleService: VehicleService,
    private readonly searchService: SearchService,
  ) {}

  async parse(question: string) {
    const normalizedQuestion = question.toLowerCase().trim();
    const words = normalizedQuestion.split(/\s+/);

    // Catalogue
    const products = await this.catalogService.getProducts();
    const brands = await this.catalogService.getBrands();

    // Véhicules
    const vehicles = await this.vehicleService.findAll();

    // Recherche du produit
    const product = products.find(product =>
      normalizedQuestion.includes(product),
    );

    // Recherche de la marque
    const brand = brands.find(brand =>
      words.includes(brand),
    );

    // Recherche du véhicule
    const vehicle = vehicles.find(vehicle => {
      if (!vehicle.model || vehicle.model.trim() === '') {
        return false;
      }

      return normalizedQuestion.includes(
        vehicle.model.toLowerCase(),
      );
    });

    // Recherche dans le stock
    const results = await this.searchService.search({
      product,
      brand,
    });

    return {
      query: {
        product,
        brand,
        vehicle,
      },
      results,
    };
  }
}
