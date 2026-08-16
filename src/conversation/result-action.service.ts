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

    // ==========================================
    // MODIFIER UNE QUANTITÉ
    // ==========================================

    if (
      intent ===
      IntentType.MODIFY_QUOTE_QUANTITY
    ) {

      if (
        !context.quote ||
        !context.quote.items?.length
      ) {

        return {
          status: 'no_quote',
          reply:
            "Je n'ai pas encore de devis en cours.",
        };
      }

      const product =
        parsed.product?.toLowerCase();

      const quantity =
        parsed.quantity;

      if (!product) {

        return {
          status: 'need_information',
          reply:
            'Quelle pièce souhaitez-vous modifier ?',
        };
      }

      if (
        !quantity ||
        quantity < 1
      ) {

        return {
          status: 'need_information',
          reply:
            'Quelle quantité souhaitez-vous ?',
        };
      }

      const item =
        context.quote.items.find(
          (quoteItem: any) =>
            quoteItem.label
              ?.toLowerCase()
              .includes(product),
        );

      if (!item) {

        return {
          status: 'not_found',
          reply:
            `Je ne trouve pas ${parsed.product} dans votre devis.`,
        };
      }

      item.quantity =
        quantity;

      this.recalculateQuote(
        context.quote,
      );

      context.quantity =
        undefined;

      return {
        status: 'quote_updated',

        reply:
          `Très bien. Je passe ${item.label} à ${quantity} exemplaires. ` +
          `Le nouveau total est de ${context.quote.total} F CFP.`,

        result: item,

        quote: context.quote,
      };
    }

    // ==========================================
    // RÉCAPITULATIF DU DEVIS
    // ==========================================

    if (
      intent ===
      IntentType.QUOTE_SUMMARY
    ) {

      if (
        !context.quote ||
        !context.quote.items?.length
      ) {

        return {
          status: 'no_quote',
          reply:
            "Je n'ai pas encore de devis en cours.",
        };
      }

      const items =
        context.quote.items
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

    // ==========================================
    // SUPPRESSION D'UNE PIÈCE
    // ==========================================

    if (
      intent ===
      IntentType.REMOVE_QUOTE_ITEM
    ) {

      if (
        !context.quote ||
        !context.quote.items?.length
      ) {

        return {
          status: 'no_quote',
          reply:
            "Je n'ai pas encore de devis en cours.",
        };
      }

      const product =
        parsed.product?.toLowerCase();

      if (!product) {

        return {
          status: 'need_information',
          reply:
            'Quelle pièce souhaitez-vous retirer du devis ?',
        };
      }

      const index =
        context.quote.items.findIndex(
          (item: any) =>
            item.label
              ?.toLowerCase()
              .includes(product),
        );

      if (index === -1) {

        return {
          status: 'not_found',
          reply:
            `Je ne trouve pas ${parsed.product} dans votre devis.`,
        };
      }

      const removed =
        context.quote.items.splice(
          index,
          1,
        )[0];

      this.recalculateQuote(
        context.quote,
      );

      if (
        context.quote.items.length === 0
      ) {

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

    // ==========================================
    // SÉLECTION PAR POSITION
    // ==========================================

    if (parsed.position) {

      const result =
        context.results[
          parsed.position - 1
        ];

      if (!result) {

        return {
          status: 'no_results',
          reply:
            `Je n'ai pas trouvé le résultat numéro ${parsed.position}.`,
        };
      }

      context.selectedResult =
        result;

      // ------------------------------------------
      // SI UN DEVIS EXISTE :
      // AJOUTER LA PIÈCE AU DEVIS
      // ------------------------------------------

      if (context.quote) {

        const quantity =
          context.quantity ?? 1;

        const quote =
          this.addResultToQuote(
            context,
            result,
            quantity,
          );

        context.quantity =
          undefined;

        return {
          status: 'quote_updated',

          reply:
            `J'ai ajouté ${quantity} ${result.label} à votre devis. ` +
            `Le nouveau total est de ${quote.total} F CFP.`,

          result,

          quote,
        };
      }

      // ------------------------------------------
      // PAS DE DEVIS :
      // SIMPLE SÉLECTION
      // ------------------------------------------

      return {
        status: 'completed',

        reply:
          `Voici le ${this.ordinal(parsed.position)} modèle : ` +
          `${result.label} à ${result.price} F CFP.`,

        result,
      };
    }

    // ==========================================
    // FILTRE PAR MARQUE
    // ==========================================

    if (parsed.brand) {

      const results =
        context.results.filter(
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

      context.results =
        results;

      return {
        status: 'completed',

        reply:
          `J'ai trouvé ${results.length} modèle(s) ${parsed.brand}.`,

        results,
      };
    }

    // ==========================================
    // AUTRES ACTIONS
    // ==========================================

    switch (intent) {

      // ------------------------------------------
      // MOINS CHER
      // ------------------------------------------

      case IntentType.CHEAPEST_RESULT: {

        const result =
          this.cheapest(
            context.results,
          );

        context.selectedResult =
          result;

        return {
          status: 'completed',

          reply:
            `Le modèle le moins cher est ${result.label} à ${result.price} F CFP.`,

          result,
        };
      }

      // ------------------------------------------
      // PLUS CHER
      // ------------------------------------------

      case IntentType.MOST_EXPENSIVE_RESULT: {

        const result =
          this.mostExpensive(
            context.results,
          );

        context.selectedResult =
          result;

        return {
          status: 'completed',

          reply:
            `Le modèle le plus cher est ${result.label} à ${result.price} F CFP.`,

          result,
        };
      }

      // ------------------------------------------
      // STOCK
      // ------------------------------------------

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

      // ------------------------------------------
      // VISITE MAGASIN
      // ------------------------------------------

      case IntentType.VISIT_STORE: {

        return {
          status: 'visit_store',

          reply:
            'Très bien. Nous vous attendrons au magasin. Si vous le souhaitez, un conseiller pourra préparer un devis avant votre arrivée.',
        };
      }

      // ------------------------------------------
      // CRÉATION DU DEVIS
      // ------------------------------------------

      case IntentType.CREATE_QUOTE: {

        const result =
          context.selectedResult ??
          context.results[0];

        if (!result) {
          return null;
        }

        const quantity =
          context.quantity ?? 1;

        const item = {
          sku: result.sku,
          label: result.label,
          brand: result.brand,
          quantity,
          unitPrice: result.price ?? 0,
        };

        // ------------------------------------------
        // SI UN DEVIS EXISTE DÉJÀ :
        // AJOUTER AU DEVIS
        // ------------------------------------------

        if (
          context.quote &&
          context.quote.items?.length
        ) {

          const quote =
            this.addResultToQuote(
              context,
              result,
              quantity,
            );

          context.quantity =
            undefined;

          return {
            status: 'quote_updated',

            reply:
              `J'ai ajouté ${quantity} ${result.label} à votre devis. ` +
              `Le nouveau total est de ${quote.total} F CFP.`,

            result,

            quote,
          };
        }

        // ------------------------------------------
        // SINON :
        // CRÉER LE PREMIER DEVIS
        // ------------------------------------------

        context.quote = {
          createdAt: new Date(),

          items: [
            item,
          ],

          total:
            item.quantity *
            item.unitPrice,
        };

        context.quantity =
          undefined;

        return {
          status: 'quote',

          reply:
            `Très bien, je prépare votre devis.\n\n` +
            `Véhicule : ${context.vehicle?.make} ${context.vehicle?.model}\n` +
            `Pièce : ${item.label}\n` +
            `Référence : ${item.sku}\n` +
            `Quantité : ${item.quantity}\n` +
            `Prix unitaire : ${item.unitPrice} F CFP\n` +
            `Total : ${context.quote.total} F CFP`,

          quote:
            context.quote,
        };
      }

      // ------------------------------------------
      // CONFIRMATION DU DEVIS
      // ------------------------------------------

      case IntentType.CONFIRM_QUOTE: {

        if (
          !context.quote ||
          !context.quote.items?.length
        ) {

          return {
            status: 'no_quote',

            reply:
              "Je n'ai pas encore de devis à valider.",
          };
        }

        return {
          status: 'quote_confirmed',

          reply:
            `Très bien, votre devis est validé. ` +
            `Le montant total est de ${context.quote.total} F CFP.`,

          quote:
            context.quote,
        };
      }

      default:
        return null;
    }
  }

  // ==========================================
  // AJOUTER UNE PIÈCE AU DEVIS
  // ==========================================

  addResultToQuote(
    context: any,
    result: any,
    quantity: number,
  ) {

    if (!context.quote) {

      context.quote = {
        createdAt: new Date(),
        items: [],
        total: 0,
      };
    }

    if (!context.quote.items) {
      context.quote.items = [];
    }

    const existingItem =
      context.quote.items.find(
        (item: any) =>
          item.sku === result.sku,
      );

    if (existingItem) {

      existingItem.quantity +=
        quantity;

    } else {

      context.quote.items.push({
        sku: result.sku,
        label: result.label,
        brand: result.brand,
        quantity,
        unitPrice: result.price ?? 0,
      });
    }

    this.recalculateQuote(
      context.quote,
    );

    return context.quote;
  }

  // ==========================================
  // RECALCUL DU TOTAL
  // ==========================================

  recalculateQuote(
    quote: any,
  ) {

    quote.total =
      quote.items.reduce(
        (
          total: number,
          item: any,
        ) =>
          total +
          item.quantity *
          item.unitPrice,
        0,
      );

    return quote;
  }

  // ==========================================
  // MOINS CHER
  // ==========================================

  cheapest(
    results: any[],
  ) {

    return results.reduce(
      (a, b) =>
        (a.price ??
          Number.MAX_SAFE_INTEGER) <
        (b.price ??
          Number.MAX_SAFE_INTEGER)
          ? a
          : b,
    );
  }

  // ==========================================
  // PLUS CHER
  // ==========================================

  mostExpensive(
    results: any[],
  ) {

    return results.reduce(
      (a, b) =>
        (a.price ?? 0) >
        (b.price ?? 0)
          ? a
          : b,
    );
  }

  // ==========================================
  // ORDINAL
  // ==========================================

  ordinal(
    position: number,
  ) {

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
