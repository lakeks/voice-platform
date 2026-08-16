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
        id: number;
        make: string;
        model: string;
        createdAt: Date;
      };

      quantity?: number;
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

    if (
      parsed.quantity !== undefined &&
      parsed.quantity > 0
    ) {
      context.quantity = parsed.quantity;
    }

    // ========================
    // DÉTERMINATION ÉTAT
    // ========================

    if (!context.product) {

      context.state =
        ConversationState.WAITING_PRODUCT;

      return context;
    }

    if (!context.vehicle) {

      context.state =
        ConversationState.WAITING_VEHICLE;

      return context;
    }

    context.state =
      ConversationState.SEARCHING;

    return context;
  }
}
