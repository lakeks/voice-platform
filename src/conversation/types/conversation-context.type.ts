import { IntentType } from '../../intent/types/intent.type';
import { ConversationState } from './conversation-state.type';

export interface ConversationContext {

  sessionId: string;

  state: ConversationState;

  intent: IntentType;

  product?: string;

  brand?: string;

  vehicle?: {
    make: string;
    model: string;
  };

  results?: {
    id: number;
    sku: string;
    productType: string;
    label: string;
    brand: string | null;
    quantity: number;
    price: number | null;
    storeId: number;
    createdAt: Date;
  }[];

}
