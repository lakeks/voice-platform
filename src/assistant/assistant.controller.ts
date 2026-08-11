import { Controller, Get, Query } from '@nestjs/common';
import { AssistantService } from './assistant.service';

@Controller('assistant')
export class AssistantController {
  constructor(
    private readonly assistantService: AssistantService,
  ) {}

  @Get('ask')
  ask(@Query('q') question: string) {
    return this.assistantService.answer(question);
  }
}
