import { Injectable } from '@nestjs/common';

import { IntentType } from '../intent/types/intent.type';

@Injectable()
export class ResultActionService {

  handle(
    context: any,
    parsed: any,
    intent: IntentType,
  ) {

    if (!context.results?.length) {
      return null;
    }

    // ------------------------
    // Sélection par position
    // ------------------------

    if (parsed.position) {

      const result = context.results[parsed.position - 1];

      if (!result) {

        return {
          status: 'no_results',
          reply: `Je n'ai pas trouvé le résultat numéro ${parsed.position}.`,
        };

      }

      context.selectedResult = result;

      return {
        status: 'completed',
        reply:
          `Voici le ${this.ordinal(parsed.position)} modèle : ` +
          `${result.label} à ${result.price} F CFP.`,
        result,
      };

    }

    // ------------------------
    // Filtre par marque
    // ------------------------

    if (parsed.brand) {

      const results = context.results.filter(
        (item: any) =>
          item.brand?.toLowerCase() ===
          parsed.brand.toLowerCase(),
      );

      if (!results.length) {

        return {
          status: 'no_results',
          reply:
            `Je n'ai trouvé aucun modèle ${parsed.brand}.`,
        };

      }

      context.results = results;

      return {
        status: 'completed',
        reply:
          `J'ai trouvé ${results.length} modèle(s) ${parsed.brand}.`,
        results,
      };

    }

    switch (intent) {

      // ------------------------
      // Moins cher
      // ------------------------

      case IntentType.CHEAPEST_RESULT: {

        const result = this.cheapest(context.results);

        context.selectedResult = result;

        return {
          status: 'completed',
          reply:
            `Le modèle le moins cher est ${result.label} à ${result.price} F CFP.`,
          result,
        };

      }

      // ------------------------
      // Plus cher
      // ------------------------

      case IntentType.MOST_EXPENSIVE_RESULT: {

        const result = this.mostExpensive(context.results);

        context.selectedResult = result;

        return {
          status: 'completed',
          reply:
            `Le modèle le plus cher est ${result.label} à ${result.price} F CFP.`,
          result,
        };

      }

      // ------------------------
      // Vérification du stock
      // ------------------------

      case IntentType.CHECK_STOCK: {

        const result =
          context.selectedResult ??
          context.results[0];

        if (!result) {
          return null;
        }

        if (result.quantity <= 0) {

          return {
            status: 'completed',
            reply:
              `${result.label} n'est actuellement plus disponible en stock.`,
            result,
          };

        }

        if (result.quantity === 1) {

          return {
            status: 'completed',
            reply:
              `Oui, il reste un exemplaire du ${result.label} en stock.`,
            result,
          };

        }

        return {
          status: 'completed',
          reply:
            `Oui, il reste ${result.quantity} exemplaires du ${result.label} en stock.`,
          result,
        };

      }

      // ------------------------
      // Le client passe au magasin
      // ------------------------

      case IntentType.VISIT_STORE: {

        return {
          status: 'visit_store',
          reply:
            'Très bien. Nous vous attendrons au magasin. Si vous le souhaitez, un conseiller pourra préparer un devis avant votre arrivée.',
        };

      }

      // ------------------------
      // Création du devis
      // ------------------------

      case IntentType.CREATE_QUOTE: {

        const result =
          context.selectedResult ??
          context.results[0];

        if (!result) {
          return null;
        }

        const item = {
          sku: result.sku,
          label: result.label,
          brand: result.brand,
          quantity: 1,
          unitPrice: result.price ?? 0,
        };

        context.quote = {
          createdAt: new Date(),
          items: [item],
          total: item.quantity * item.unitPrice,
        };

        return {
          status: 'quote',
          reply:
            `Très bien, je prépare votre devis.\n\n` +
            `Véhicule : ${context.vehicle?.make} ${context.vehicle?.model}\n` +
            `Pièce : ${item.label}\n` +
            `Référence : ${item.sku}\n` +
            `Prix : ${item.unitPrice} F CFP`,
          quote: context.quote,
        };

      }

      default:
        return null;

    }

  }

  cheapest(results: any[]) {

    return results.reduce((a, b) =>
      (a.price ?? Number.MAX_SAFE_INTEGER) <
      (b.price ?? Number.MAX_SAFE_INTEGER)
        ? a
        : b,
    );

  }

  mostExpensive(results: any[]) {

    return results.reduce((a, b) =>
      (a.price ?? 0) >
      (b.price ?? 0)
        ? a
        : b,
    );

  }

  ordinal(position: number) {

    switch (position) {

      case 1:
        return 'premier';

      case 2:
        return 'deuxième';

      case 3:
        return 'troisième';

      default:
        return `${position}ème`;

    }

  }

}
