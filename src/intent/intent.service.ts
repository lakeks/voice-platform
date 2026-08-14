import { Injectable } from '@nestjs/common';
import { IntentType } from './types/intent.type';
import { ConversationState } from '../conversation/types/conversation-state.type';

@Injectable()
export class IntentService {

  detect(
    message: string,
    state?: ConversationState,
  ): IntentType {

    const text = message.toLowerCase();

    // Récapitulatif du devis

    if (
      text.includes('c\'est quoi le total') ||
      text.includes('ça fait combien') ||
      text.includes('ca fait combien') ||
      text.includes('combien au total') ||
      text.includes('quel est le total') ||
      text.includes('rappeler ce que j\'ai pris') ||
      text.includes('rappeler ce que j ai pris') ||
      text.includes('détail du devis') ||
      text.includes('detail du devis') ||
      text.includes('sur le devis')
    ) {
      return IntentType.QUOTE_SUMMARY;
    }

    // Demande de devis

    if (
      text.includes('devis') ||
      text.includes('préparez') ||
      text.includes('preparer un devis') ||
      text.includes('préparer un devis')
    ) {
      return IntentType.CREATE_QUOTE;
    }

    // Disponibilité

    if (
      text.includes('stock') ||
      text.includes('disponible') ||
      text.includes('disponibilité') ||
      text.includes('vous en avez')
    ) {
      return IntentType.CHECK_STOCK;
    }

    // Le client va passer au magasin

    if (
      text.includes('je passe') ||
      text.includes('je viendrai') ||
      text.includes('je viens') ||
      text.includes('cet après-midi') ||
      text.includes('ce matin') ||
      text.includes('demain')
    ) {
      return IntentType.VISIT_STORE;
    }

    // Le moins cher

    if (
      text.includes('moins cher') ||
      text.includes('moins chère')
    ) {
      return IntentType.CHEAPEST_RESULT;
    }

    // Le plus cher

    if (
      text.includes('plus cher') ||
      text.includes('plus chère')
    ) {
      return IntentType.MOST_EXPENSIVE_RESULT;
    }

    // Si on attend une information

    if (
      state === ConversationState.WAITING_PRODUCT ||
      state === ConversationState.WAITING_VEHICLE
    ) {
      return IntentType.SEARCH_PART;
    }

    if (
      text.includes('cherche') ||
      text.includes('besoin') ||
      text.includes('voudrais') ||
      text.includes('alternateur') ||
      text.includes('batterie') ||
      text.includes('filtre') ||
      text.includes('plaquette')
    ) {
      return IntentType.SEARCH_PART;
    }

    if (
      text.includes('bonjour') ||
      text.includes('salut') ||
      text.includes('bonsoir')
    ) {
      return IntentType.GREETING;
    }

    if (text.includes('merci')) {
      return IntentType.THANKS;
    }

    if (
      text.includes('au revoir') ||
      text.includes('à bientôt')
    ) {
      return IntentType.GOODBYE;
    }

    if (
      text.includes('vendeur') ||
      text.includes('conseiller') ||
      text.includes('humain')
    ) {
      return IntentType.HUMAN_TRANSFER;
    }

    return IntentType.UNKNOWN;

  }

}
