import { Injectable } from '@nestjs/common';

@Injectable()
export class ConversationResponseService {

  buildSearchResult(
    vehicle: string,
    label: string,
    quantity: number,
    price: number | null,
  ): string {

    const displayPrice = price ?? 0;

    if (quantity === 1) {

      return (
        `J'ai trouvé ${label} compatible avec votre ${vehicle}. ` +
        `Il reste un exemplaire en stock à ${displayPrice} F CFP.`
      );
    }

    return (
      `J'ai trouvé ${label} compatible avec votre ${vehicle}. ` +
      `Il reste ${quantity} exemplaires en stock à ${displayPrice} F CFP l'unité.`
    );
  }

  buildResultList(
    vehicle: string,
    results: any[],
  ): string {

    if (!results || results.length === 0) {

      return (
        `Je n'ai trouvé aucune pièce compatible ` +
        `avec votre ${vehicle}.`
      );
    }

    // ========================
    // UN SEUL RÉSULTAT
    // ========================

    if (results.length === 1) {

      const item = results[0];

      const price = item.price ?? 0;

      return (
        `J'ai trouvé ${item.label} compatible avec votre ` +
        `${vehicle}, à ${price} F CFP.`
      );
    }

    // ========================
    // PLUSIEURS RÉSULTATS
    // ========================

    const lines: string[] = [];

    const max =
      Math.min(results.length, 5);

    for (let i = 0; i < max; i++) {

      const item = results[i];

      lines.push(
        `${i + 1}. ${item.label} à ${item.price ?? 0} F CFP`,
      );
    }

    return (
      `J'ai trouvé ${results.length} pièces compatibles ` +
      `avec votre ${vehicle}.\n` +
      lines.join('\n') +
      `\nVous pouvez me dire laquelle vous préférez, ` +
      `par exemple le premier, le deuxième, le moins cher ` +
      `ou le plus cher.`
    );
  }
}
