import { Injectable } from '@nestjs/common';

import { IntentService } from '../intent/intent.service';
import { IntentType } from '../intent/types/intent.type';

import { ParserService } from '../parser/parser.service';
import { SearchService } from '../search/search.service';

import { ConversationMemory } from './conversation.memory';
import { ConversationContextService } from './conversation-context.service';
import { ConversationResponseService } from './conversation-response.service';
import { ResultActionService } from './result-action.service';

import { ConversationContext } from './types/conversation-context.type';
import { ConversationState } from './types/conversation-state.type';

@Injectable()
export class ConversationManager {

  constructor(
    private readonly intentService: IntentService,
    private readonly parserService: ParserService,
    private readonly searchService: SearchService,
    private readonly conversationMemory: ConversationMemory,
    private readonly contextService: ConversationContextService,
    private readonly responseService: ConversationResponseService,
    private readonly resultActionService: ResultActionService,
  ) {}

  private loadOrCreateContext(
    sessionId: string,
  ): ConversationContext {

    const existing =
      this.conversationMemory.get(sessionId);

    if (existing) {
      return existing;
    }

    return {
      sessionId,
      state: ConversationState.IDLE,
      intent: IntentType.UNKNOWN,
    };
  }

  async process(
    message: string,
    sessionId = 'default',
  ) {

    let context =
      this.loadOrCreateContext(sessionId);

    // ==========================================
    // INTENTION
    // ==========================================

    const intent =
      this.intentService.detect(
        message,
        context.state,
      );

    context.intent = intent;

    // ==========================================
    // PARSING
    // ==========================================

    const parsed =
      await this.parserService.parse(message);

    // ==========================================
    // NOUVELLE RECHERCHE DE PIÈCE
    // ==========================================

    const isNewPartSearch =
      (
        intent === IntentType.SEARCH_PART ||
        intent === IntentType.ADD_QUOTE_ITEM
      ) &&
      !!parsed.product;

    if (isNewPartSearch) {

      // Si c'est une demande d'ajout au devis,
      // un devis doit déjà exister.

      if (
        intent === IntentType.ADD_QUOTE_ITEM &&
        !context.quote
      ) {

        this.conversationMemory.save(context);

        return {
          status: 'no_quote',
          reply:
            "Je n'ai pas encore de devis en cours.",
        };
      }

      // ----------------------------------------
      // Mise à jour du produit et de la marque
      // ----------------------------------------

      if (parsed.product) {
        context.product =
          parsed.product;
      }

      if (parsed.brand) {
        context.brand =
          parsed.brand;
      }

      if (parsed.vehicle) {
        context.vehicle =
          parsed.vehicle;
      }

      // ----------------------------------------
      // Nouvelle recherche
      // ----------------------------------------

      const results =
        await this.searchService.search({
          product: parsed.product,
          brand: parsed.brand,
        });

      context.results =
        results;

      // ----------------------------------------
      // Aucun résultat
      // ----------------------------------------

      if (!results.length) {

        this.conversationMemory.save(context);

        return {
          status: 'no_results',
          reply:
            parsed.brand
              ? `Je n'ai trouvé aucun modèle ${parsed.brand}.`
              : "Je n'ai trouvé aucune pièce correspondante.",
          results,
        };
      }

      // ----------------------------------------
      // AJOUT AU DEVIS
      // ----------------------------------------

      if (
        intent === IntentType.ADD_QUOTE_ITEM &&
        context.quote
      ) {

        const result =
          results[0];

        const quantity =
          parsed.quantity ?? 1;

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
            unitPrice:
              result.price ?? 0,
          });
        }

        // --------------------------------------
        // Recalcul du total
        // --------------------------------------

        context.quote.total =
          context.quote.items.reduce(
            (
              total: number,
              item: any,
            ) =>
              total +
              item.quantity *
              item.unitPrice,
            0,
          );

        context.selectedResult =
          result;

        context.quantity =
          undefined;

        context.state =
          ConversationState.FINISHED;

        this.conversationMemory.save(
          context,
        );

        return {
          status: 'quote_updated',

          reply:
            `J'ai ajouté ${quantity} ${result.label} à votre devis. ` +
            `Le nouveau total est de ${context.quote.total} F CFP.`,

          result,

          quote:
            context.quote,
        };
      }

      // --------------------------------------
      // Recherche normale
      // --------------------------------------

      context.state =
        ConversationState.FINISHED;

      this.conversationMemory.save(
        context,
      );

      let reply =
        'Aucune pièce trouvée.';

      if (results.length > 0) {

        // Si le véhicule a été reconnu,
        // on utilise son nom.
        //
        // Sinon on utilise une formulation
        // générique afin de ne JAMAIS envoyer
        // "undefined undefined" au client.

        const vehicleLabel =
          context.vehicle
            ? `${context.vehicle.make} ${context.vehicle.model}`
            : 'votre véhicule';

        reply =
          this.responseService.buildResultList(
            vehicleLabel,
            results,
          );
      }

      return {
        status: 'completed',
        reply,
        query: context,
        results,
      };
    }

    // ==========================================
    // ACTIONS SUR LES RÉSULTATS EXISTANTS
    // ==========================================

    const action =
      this.resultActionService.handle(
        context,
        parsed,
        intent,
      );

    if (action) {

      this.conversationMemory.save(
        context,
      );

      return action;
    }

    // ==========================================
    // INTENTIONS DIRECTES
    // ==========================================

    switch (intent) {

      // ----------------------------------------
      // Bonjour
      // ----------------------------------------

      case IntentType.GREETING:

        context.state =
          ConversationState.GREETING;

        this.conversationMemory.save(
          context,
        );

        return {
          status: 'greeting',
          reply:
            'Bonjour ! Comment puis-je vous aider ?',
        };


      // ----------------------------------------
      // Merci
      // ----------------------------------------

      case IntentType.THANKS:

        return {
          status: 'thanks',
          reply:
            'Avec plaisir !',
        };


      // ----------------------------------------
      // Au revoir
      // ----------------------------------------

      case IntentType.GOODBYE:

        context.state =
          ConversationState.FINISHED;

        this.conversationMemory.clear(
          sessionId,
        );

        return {
          status: 'goodbye',
          reply:
            'Au revoir et bonne journée !',
        };


      // ----------------------------------------
      // Transfert humain
      // ----------------------------------------

      case IntentType.HUMAN_TRANSFER:

        context.state =
          ConversationState.TRANSFER_HUMAN;

        this.conversationMemory.save(
          context,
        );

        return {
          status: 'human_transfer',
          reply:
            'Je vous mets en relation avec un conseiller.',
        };


      // ----------------------------------------
      // Recherche de pièce
      // ----------------------------------------

      case IntentType.SEARCH_PART:

        break;


      // ----------------------------------------
      // Ajout au devis
      // ----------------------------------------

      case IntentType.ADD_QUOTE_ITEM:

        return {
          status: 'need_information',
          reply:
            'Quelle pièce souhaitez-vous ajouter au devis ?',
        };


      // ----------------------------------------
      // Par défaut
      // ----------------------------------------

      default:

        return {
          status: 'unknown',
          reply:
            "Je n'ai pas compris votre demande.",
        };
    }

    // ==========================================
    // MISE À JOUR DU CONTEXTE
    // ==========================================

    context =
      this.contextService.update(
        context,
        parsed,
      );

    this.conversationMemory.save(
      context,
    );

    // ==========================================
    // INFORMATIONS MANQUANTES
    // ==========================================

    if (
      context.state ===
      ConversationState.WAITING_PRODUCT
    ) {

      return {
        status: 'need_information',
        reply:
          'Quelle pièce recherchez-vous ?',
      };
    }

    if (
      context.state ===
      ConversationState.WAITING_VEHICLE
    ) {

      return {
        status: 'need_information',
        reply:
          'Pour quel véhicule recherchez-vous cette pièce ?',
      };
    }

    // ==========================================
    // RECHERCHE
    // ==========================================

    const results =
      await this.searchService.search({
        product: context.product,
        brand: context.brand,
      });

    context.results =
      results;

    context.state =
      ConversationState.FINISHED;

    this.conversationMemory.save(
      context,
    );

    // ==========================================
    // RÉPONSE
    // ==========================================

    let reply =
      'Aucune pièce trouvée.';

    if (results.length > 0) {

      const vehicleLabel =
        context.vehicle
          ? `${context.vehicle.make} ${context.vehicle.model}`
          : 'votre véhicule';

      reply =
        this.responseService.buildResultList(
          vehicleLabel,
          results,
        );
    }

    return {
      status: 'completed',
      reply,
      query: context,
      results,
    };
  }
}
