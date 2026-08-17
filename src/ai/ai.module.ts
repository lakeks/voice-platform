import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { SttService } from './stt.service';

import { ConversationModule } from '../conversation/conversation.module';

@Module({
  imports: [
    ConfigModule,
    ConversationModule,
  ],

  controllers: [
    AiController,
  ],

  providers: [
    AiService,
    SttService,
  ],

  exports: [
    AiService,
    SttService,
  ],
})
export class AiModule {}
