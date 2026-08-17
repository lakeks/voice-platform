import { Module } from '@nestjs/common';

import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ConversationManager } from './conversation.manager';
import { ConversationMemory } from './conversation.memory';
import { ConversationContextService } from './conversation-context.service';
import { ConversationResponseService } from './conversation-response.service';
import { ResultActionService } from './result-action.service';

import { ParserModule } from '../parser/parser.module';
import { SearchModule } from '../search/search.module';
import { IntentModule } from '../intent/intent.module';

@Module({
  imports: [
    ParserModule,
    SearchModule,
    IntentModule,
  ],

  controllers: [
    ConversationController,
  ],

  providers: [
    ConversationService,
    ConversationManager,
    ConversationMemory,
    ConversationContextService,
    ConversationResponseService,
    ResultActionService,
  ],

  exports: [
    ConversationManager,
  ],
})
export class ConversationModule {}
