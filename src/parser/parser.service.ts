import { Injectable } from '@nestjs/common';

import { CatalogService } from '../catalog/catalog.service';
import { VehicleService } from '../vehicle/vehicle.service';

import { ParserResult } from './types/parser-result.type';

@Injectable()
export class ParserService {

  constructor(
    private readonly catalogService: CatalogService,
    private readonly vehicleService: VehicleService,
  ) {}

  async parse(question: string): Promise<ParserResult> {

    const normalizedQuestion = question.toLowerCase().trim();
    const words = normalizedQuestion
      .replace(/[.,!?;:]/g, '')
      .split(/\s+/);

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
      words.includes(brand.toLowerCase()),
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

    // Position demandée

    let position: number | undefined;

    if (
      normalizedQuestion.includes('premier') ||
      normalizedQuestion.includes('première')
    ) {
      position = 1;
    }

    if (
      normalizedQuestion.includes('deuxième') ||
      normalizedQuestion.includes('second')
    ) {
      position = 2;
    }

    return {

      product,

      brand,

      vehicle,

      words,

      position,

    };

  }

}
