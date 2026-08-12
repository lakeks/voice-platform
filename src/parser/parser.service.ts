import { Injectable } from '@nestjs/common';
import { CatalogService } from '../catalog/catalog.service';
import { VehicleService } from '../vehicle/vehicle.service';

@Injectable()
export class ParserService {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly vehicleService: VehicleService,
  ) {}

  async parse(question: string) {

    const normalizedQuestion = question.toLowerCase().trim();
    const words = normalizedQuestion.split(/\s+/);

    // Catalogue
    const products = await this.catalogService.getProducts();
    const brands = await this.catalogService.getBrands();

    // Véhicules
    const vehicles = await this.vehicleService.findAll();

    // Produit
    const product = products.find(product =>
      normalizedQuestion.includes(product),
    );

    // Marque
    const brand = brands.find(brand =>
      words.includes(brand),
    );

    // Véhicule
    const vehicle = vehicles.find(vehicle => {

      if (!vehicle.model || vehicle.model.trim() === '') {
        return false;
      }

      return normalizedQuestion.includes(
        vehicle.model.toLowerCase(),
      );

    });

    return {
      product,
      brand,
      vehicle,
      words,
    };

  }
}
