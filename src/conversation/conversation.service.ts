import { Injectable } from '@nestjs/common';

import { ConversationManager } from './conversation.manager';

@Injectable()
export class ConversationService {

  constructor(
    private readonly conversationManager: ConversationManager,
  ) {}

  async process(message: string, sessionId?: string) {
    return this.conversationManager.process(message, sessionId);
  }

}
