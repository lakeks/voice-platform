import { Controller, Get, Query } from '@nestjs/common';
import { ParserService } from './parser.service';

@Controller('parser')
export class ParserController {
  constructor(
    private readonly parserService: ParserService,
  ) {}

  @Get('parse')
  async parse(@Query('q') question: string) {
    return await this.parserService.parse(question);
  }
}
