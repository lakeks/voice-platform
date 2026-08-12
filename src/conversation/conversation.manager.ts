import { Injectable } from '@nestjs/common';

import { IntentService } from '../intent/intent.service';
import { IntentType } from '../intent/types/intent.type';

import { ParserService } from '../parser/parser.service';
import { SearchService } from '../search/search.service';

import { ConversationMemory } from './conversation.memory';
import { ConversationContextService } from './conversation-context.service';

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
  ) {}

  private loadOrCreateContext(
    sessionId: string,
  ): ConversationContext {

    const existing = this.conversationMemory.get(sessionId);

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

    let context = this.loadOrCreateContext(sessionId);

    const intent = this.intentService.detect(
      message,
      context.state,
    );

    context.intent = intent;

    switch (intent) {

      case IntentType.GREETING:

        context.state = ConversationState.GREETING;

        this.conversationMemory.save(context);

        return {
          status: 'greeting',
          reply: 'Bonjour ! Comment puis-je vous aider ?',
        };

      case IntentType.THANKS:

        return {
          status: 'thanks',
          reply: 'Avec plaisir !',
        };

      case IntentType.GOODBYE:

        context.state = ConversationState.FINISHED;

        this.conversationMemory.clear(sessionId);

        return {
          status: 'goodbye',
          reply: 'Au revoir et bonne journée !',
        };

      case IntentType.HUMAN_TRANSFER:

        context.state = ConversationState.TRANSFER_HUMAN;

        this.conversationMemory.save(context);

        return {
          status: 'human_transfer',
          reply: 'Je vous mets en relation avec un conseiller.',
        };

      case IntentType.SEARCH_PART:
        break;

      default:

        return {
          status: 'unknown',
          reply: "Je n'ai pas compris votre demande.",
        };

    }

    const parsed = await this.parserService.parse(message);

    context = this.contextService.update(
      context,
      parsed,
    );

    this.conversationMemory.save(context);

    if (context.state === ConversationState.WAITING_PRODUCT) {

      return {
        status: 'need_information',
        reply: 'Quelle pièce recherchez-vous ?',
      };

    }

    if (context.state === ConversationState.WAITING_VEHICLE) {

      return {
        status: 'need_information',
        reply: 'Pour quel véhicule recherchez-vous cette pièce ?',
      };

    }

    const results = await this.searchService.search({

      product: context.product,

      brand: context.brand,

    });

    context.state = ConversationState.FINISHED;

    this.conversationMemory.save(context);

    return {

      status: 'completed',

      query: context,

      results,

    };

  }

}
