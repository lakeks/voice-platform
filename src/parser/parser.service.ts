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

    const normalizedQuestion = question
      .toLowerCase()
      .trim();

    const words = normalizedQuestion
      .replace(/[.,!?;:]/g, '')
      .split(/\s+/);

    const products = await this.catalogService.getProducts();
    const brands = await this.catalogService.getBrands();
    const vehicles = await this.vehicleService.findAll();

    // ========================
    // PRODUIT
    // ========================

    const product = products.find(
      item =>
        normalizedQuestion.includes(
          item.toLowerCase(),
        ),
    );

    // ========================
    // MARQUE
    // ========================

    const brand = brands.find(
      item =>
        words.includes(item.toLowerCase()),
    );

    // ========================
    // VÉHICULE
    // ========================

    const vehicle = vehicles.find(item => {

      if (!item.model || item.model.trim() === '') {
        return false;
      }

      return normalizedQuestion.includes(
        item.model.toLowerCase(),
      );
    });

    // ========================
    // POSITION
    // ========================

    let position: number | undefined;

    if (
      normalizedQuestion.includes('premier') ||
      normalizedQuestion.includes('première')
    ) {
      position = 1;
    }

    if (
      normalizedQuestion.includes('deuxième') ||
      normalizedQuestion.includes('deuxieme') ||
      normalizedQuestion.includes('second')
    ) {
      position = 2;
    }

    if (
      normalizedQuestion.includes('troisième') ||
      normalizedQuestion.includes('troisieme')
    ) {
      position = 3;
    }

    // ========================
    // QUANTITÉ
    // ========================

    let quantity: number | undefined;

    if (product) {

      const productPattern =
        `${product.toLowerCase()}s?`;

      const writtenQuantities: Record<string, number> = {
        une: 1,
        un: 1,
        deux: 2,
        trois: 3,
        quatre: 4,
        cinq: 5,
        six: 6,
        sept: 7,
        huit: 8,
        neuf: 9,
        dix: 10,
      };

      // Quantités écrites

      for (
        const [word, value]
        of Object.entries(writtenQuantities)
      ) {

        const pattern = new RegExp(
          `\\b${word}\\b(?:\\s+\\w+){0,3}\\s+${productPattern}\\b`,
          'i',
        );

        if (pattern.test(normalizedQuestion)) {
          quantity = value;
          break;
        }
      }

      // Quantité numérique

      if (quantity === undefined) {

        const numericPattern = new RegExp(
          `\\b(\\d+)\\b(?:\\s+\\w+){0,3}\\s+${productPattern}\\b`,
          'i',
        );

        const match =
          normalizedQuestion.match(numericPattern);

        if (match) {
          quantity = Number(match[1]);
        }
      }

      // Une / un produit

      if (quantity === undefined) {

        const singularPattern = new RegExp(
          `\\b(?:une|un)\\b(?:\\s+\\w+){0,3}\\s+${productPattern}\\b`,
          'i',
        );

        if (singularPattern.test(normalizedQuestion)) {
          quantity = 1;
        }
      }
    }

    return {
      product,
      brand,
      vehicle,
      words,
      position,
      quantity,
    };
  }
}
