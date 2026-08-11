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

    const products = await this.catalogService.getProducts();
    const brands = await this.catalogService.getBrands();

    const vehicles = await this.vehicleService.findAll();

    const product = products.find(product =>
      normalizedQuestion.includes(product),
    );

    const brand = brands.find(brand =>
      words.includes(brand),
    );

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
