import { Injectable } from '@nestjs/common';

import { IntentType } from '../intent/types/intent.type';

@Injectable()
export class ResultActionService {

  handle(
    context: any,
    parsed: any,
    intent: IntentType,
  ) {

    if (!context.results?.length && !context.quote) {
      return null;
    }

    // ------------------------
    // Récapitulatif du devis
    // ------------------------

    if (intent === IntentType.QUOTE_SUMMARY) {

      if (!context.quote || !context.quote.items?.length) {

        return {
          status: 'no_quote',
          reply: "Je n'ai pas encore de devis en cours.",
        };

      }

      const items = context.quote.items
        .map(
          (item: any) =>
            `${item.quantity} ${item.label} à ${item.unitPrice} F CFP`,
        )
        .join(', ');

      return {
        status: 'quote_summary',
        reply:
          `Bien sûr. Sur votre devis, vous avez : ${items}. ` +
          `Le total est de ${context.quote.total} F CFP.`,
        quote: context.quote,
      };

    }

    // ------------------------
    // Suppression d'une pièce
    // ------------------------

    if (intent === IntentType.REMOVE_QUOTE_ITEM) {

      if (!context.quote || !context.quote.items?.length) {

        return {
          status: 'no_quote',
          reply: "Je n'ai pas encore de devis en cours.",
        };

      }

      const product = parsed.product?.toLowerCase();

      if (!product) {

        return {
          status: 'need_information',
          reply:
            "Quelle pièce souhaitez-vous retirer du devis ?",
        };

      }

      const index = context.quote.items.findIndex(
        (item: any) =>
          item.label?.toLowerCase().includes(product),
      );

      if (index === -1) {

        return {
          status: 'not_found',
          reply:
            `Je ne trouve pas ${parsed.product} dans votre devis.`,
        };

      }

      const removed = context.quote.items.splice(index, 1)[0];

      context.quote.total = context.quote.items.reduce(
        (total: number, item: any) =>
          total + (item.quantity * item.unitPrice),
        0,
      );

      if (context.quote.items.length === 0) {

        return {
          status: 'quote_updated',
          reply:
            `${removed.label} a été retiré de votre devis. ` +
            `Votre devis ne contient plus aucune pièce.`,
          removed,
          quote: context.quote,
        };

      }

      return {
        status: 'quote_updated',
        reply:
          `${removed.label} a été retiré de votre devis. ` +
          `Le nouveau total est de ${context.quote.total} F CFP.`,
        removed,
        quote: context.quote,
      };

    }

    // ------------------------
    // Sélection par position
    // ------------------------

    if (parsed.position) {

      const result = context.results[parsed.position - 1];

      if (!result) {

        return {
          status: 'no_results',
          reply:
            `Je n'ai pas trouvé le résultat numéro ${parsed.position}.`,
        };

      }

      context.selectedResult = result;

      // Si un devis existe déjà, on ajoute le produit au devis

      if (context.quote) {

        const existingItem = context.quote.items.find(
          (item: any) => item.sku === result.sku,
        );

        if (existingItem) {

          existingItem.quantity += 1;

        } else {

          context.quote.items.push({
            sku: result.sku,
            label: result.label,
            brand: result.brand,
            quantity: 1,
            unitPrice: result.price ?? 0,
          });

        }

        context.quote.total = context.quote.items.reduce(
          (total: number, item: any) =>
            total + (item.quantity * item.unitPrice),
          0,
        );

        return {
          status: 'quote_updated',
          reply:
            `J'ai ajouté ${result.label} à votre devis. ` +
            `Le nouveau total est de ${context.quote.total} F CFP.`,
          result,
          quote: context.quote,
        };

      }

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
