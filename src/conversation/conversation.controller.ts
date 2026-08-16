import {
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';

import { ConversationService } from './conversation.service';
import { ConversationDto } from './dto/conversation.dto';

@Controller('conversation')
export class ConversationController {

  constructor(
    private readonly conversationService: ConversationService,
  ) {}

  @Post()
  @HttpCode(200)
  async process(
    @Body() body: ConversationDto,
  ) {

    return await this.conversationService.process(
      body.message,
      body.sessionId,
    );
  }
}
