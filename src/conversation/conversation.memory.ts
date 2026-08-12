import { Injectable } from '@nestjs/common';
import { ConversationContext } from './types/conversation-context.type';

@Injectable()
export class ConversationMemory {

  private readonly conversations = new Map<string, ConversationContext>();

  get(sessionId: string): ConversationContext | undefined {
    return this.conversations.get(sessionId);
  }

  save(context: ConversationContext): void {
    this.conversations.set(context.sessionId, context);
  }

  clear(sessionId: string): void {
    this.conversations.delete(sessionId);
  }
}
