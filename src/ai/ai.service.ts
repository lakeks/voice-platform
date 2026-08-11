import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  async analyze(question: string) {
    throw new Error('Gradium non configuré.');
  }
}
