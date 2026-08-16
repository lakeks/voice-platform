import { IntentType } from '../../intent/types/intent.type';
import { ConversationState } from './conversation-state.type';

export interface ConversationContext {

  sessionId: string;

  state: ConversationState;

  intent: IntentType;

  product?: string;

  brand?: string;

  quantity?: number;

  vehicle?: {
    id?: number;
    make: string;
    model: string;
    createdAt?: Date;
  };

  results?: any[];

  selectedResult?: any;

  quote?: {
    createdAt: Date;
    items: any[];
    total: number;
  };

  pendingStockConfirmation?: {
    result: any;
    requestedQuantity: number;
    availableQuantity: number;
    addingToQuote: boolean;
  };
}
