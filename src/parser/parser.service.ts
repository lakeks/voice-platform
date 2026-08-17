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

    // ========================
    // QUANTITÉ AVEC PRODUIT
    // ========================

    if (product) {

      const productPattern =
        `${product.toLowerCase()}s?`;

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

    // ========================
    // QUANTITÉ SANS PRODUIT
    // ========================
    //
    // Exemples :
    // "Finalement, je vais en prendre deux"
    // "Je vais en prendre trois"
    // "Vous pouvez m'en mettre deux ?"
    // "Je vais en mettre deux"
    //

    if (quantity === undefined) {

      for (
        const [word, value]
        of Object.entries(writtenQuantities)
      ) {

        if (
          normalizedQuestion.includes(
            `en prendre ${word}`,
          ) ||
          normalizedQuestion.includes(
            `en mettre ${word}`,
          ) ||
          normalizedQuestion.includes(
            `m'en mettre ${word}`,
          ) ||
          normalizedQuestion.includes(
            `m en mettre ${word}`,
          ) ||
          normalizedQuestion.includes(
            `j'en prends ${word}`,
          ) ||
          normalizedQuestion.includes(
            `j en prends ${word}`,
          ) ||
          normalizedQuestion.includes(
            `en prends ${word}`,
          ) ||
          normalizedQuestion.includes(
            `en mets ${word}`,
          )
        ) {
          quantity = value;
          break;
        }
      }
    }

    // ========================
    // QUANTITÉ NUMÉRIQUE
    // SANS PRODUIT
    // ========================

    if (quantity === undefined) {

      const contextualQuantityPattern =
        /\b(?:en prendre|en mettre|m'en mettre|m en mettre|j'en prends|j en prends|en prends|en mets)\s+(\d+)\b/i;

      const match =
        normalizedQuestion.match(
          contextualQuantityPattern,
        );

      if (match) {
        quantity = Number(match[1]);
      }
    }

    // ========================
    // QUANTITÉ APRÈS LE PRODUIT
    // ========================
    //
    // Exemples :
    // "Passez l'alternateur à 2"
    // "Mettez l'alternateur à deux"
    //

    if (
      quantity === undefined &&
      product
    ) {

      const quantityAfterProductPattern =
        new RegExp(
          `\\b${product.toLowerCase()}s?\\b(?:\\s+\\w+){0,4}\\s+(?:à|a)\\s+(\\d+|une?|deux|trois|quatre|cinq|six|sept|huit|neuf|dix)\\b`,
          'i',
        );

      const match =
        normalizedQuestion.match(
          quantityAfterProductPattern,
        );

      if (match) {

        const value =
          match[1].toLowerCase();

        quantity =
          writtenQuantities[value] ??
          Number(value);
      }
    }

    // ========================
    // QUANTITÉ ÉCRITE APRÈS
    // "à deux"
    // ========================

    if (quantity === undefined) {

      const quantityAfterPattern =
        /\b(?:à|a)\s+(une?|deux|trois|quatre|cinq|six|sept|huit|neuf|dix)\b/i;

      const match =
        normalizedQuestion.match(
          quantityAfterPattern,
        );

      if (match) {

        const value =
          match[1].toLowerCase();

        quantity =
          writtenQuantities[value] ??
          Number(value);
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
