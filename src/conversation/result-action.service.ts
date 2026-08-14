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

      case IntentType.CHECK_STOCK: {

        const result =
          context.selectedResult ??
          context.results[0];

        if (!result) {
          return null;
        }

        return {

          status: 'completed',

          reply:
            `Oui, il reste ${result.quantity} exemplaire(s) du ${result.label} en stock.`,

          result,

        };

      }

      case IntentType.VISIT_STORE: {

        return {

          status: 'visit_store',

          reply:
            'Très bien. Nous vous attendrons au magasin. Si vous le souhaitez, un conseiller pourra préparer un devis avant votre arrivée.',

        };

      }

      case IntentType.CREATE_QUOTE: {

        const result =
          context.selectedResult ??
          context.results[0];

        if (!result) {
          return null;
        }

        return {

          status: 'quote',

          reply:
            `Très bien, je prépare votre devis.\n\n` +
            `Véhicule : ${context.vehicle.make} ${context.vehicle.model}\n` +
            `Pièce : ${result.label}\n` +
            `Prix : ${result.price} F CFP`,

          quote: {

            vehicle: context.vehicle,

            product: result,

            createdAt: new Date(),

          },

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
