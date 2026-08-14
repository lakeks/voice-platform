import { IntentType } from '../../intent/types/intent.type';
import { ConversationState } from './conversation-state.type';

export interface ConversationContext {

  sessionId: string;

  state: ConversationState;

  intent: IntentType;

  product?: string;

  brand?: string;

  vehicle?: any;

  results?: any[];

  selectedResult?: any;

  quote?: {

    createdAt: Date;

    items: any[];

    total: number;

  };

}
