import { Injectable } from '@nestjs/common';

import { ConversationContext } from './types/conversation-context.type';
import { ConversationState } from './types/conversation-state.type';

@Injectable()
export class ConversationContextService {

  update(
    context: ConversationContext,
    parsed: {
      product?: string;
      brand?: string;
      vehicle?: {
        make: string;
        model: string;
      };
    },
  ): ConversationContext {

    if (parsed.product) {
      context.product = parsed.product;
    }

    if (parsed.brand) {
      context.brand = parsed.brand;
    }

    if (parsed.vehicle) {
      context.vehicle = parsed.vehicle;
    }

    // Détermination automatique de l'état

    if (!context.product) {
      context.state = ConversationState.WAITING_PRODUCT;
      return context;
    }

    if (!context.vehicle) {
      context.state = ConversationState.WAITING_VEHICLE;
      return context;
    }

    context.state = ConversationState.SEARCHING;

    return context;
  }

}
