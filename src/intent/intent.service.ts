import { Injectable } from '@nestjs/common';
import { IntentType } from './types/intent.type';
import { ConversationState } from '../conversation/types/conversation-state.type';

@Injectable()
export class IntentService {

  detect(
    message: string,
    state?: ConversationState,
  ): IntentType {

    // Si on attend une information, toute réponse est considérée
    // comme une continuation de recherche.
    if (
      state === ConversationState.WAITING_PRODUCT ||
      state === ConversationState.WAITING_VEHICLE
    ) {
      return IntentType.SEARCH_PART;
    }

    const text = message.toLowerCase();

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
