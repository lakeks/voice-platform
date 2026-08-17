import { Controller, Get, Post } from '@nestjs/common';

import { AiService } from './ai.service';
import { SttService } from './stt.service';
import { ConversationManager } from '../conversation/conversation.manager';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly sttService: SttService,
    private readonly conversationManager: ConversationManager,
  ) {}

  @Post('test')
  async test() {
    const filePath = await this.aiService.test();

    return {
      success: true,
      filePath,
    };
  }

  @Post('stt-test')
  async sttTest() {
    const filePath =
      `${process.cwd()}/audio/gradium-accueil-8k.wav`;

    const start = Date.now();

    const transcript =
      await this.sttService.transcribeFile(filePath);

    const elapsed =
      ((Date.now() - start) / 1000).toFixed(2);

    console.log(`⏱️ STT : ${elapsed} s`);

    return {
      success: true,
      filePath,
      transcript,
      sttTime: `${elapsed} s`,
    };
  }

  @Get('stt-recording')
  async sttRecording() {

    const totalStart = Date.now();

    const inputFile =
      '/var/lib/asterisk/sounds/client-test.wav';

    // ========================================
    // STT
    // ========================================

    const sttStart = Date.now();

    const transcript =
      await this.sttService.transcribeFile(
        inputFile,
      );

    const sttTime =
      ((Date.now() - sttStart) / 1000).toFixed(2);

    console.log(
      `⏱️ STT terminé : ${sttTime} s`,
    );

    console.log(
      `📝 TRANSCRIPTION : ${transcript}`,
    );

    if (
      !transcript ||
      !transcript.trim()
    ) {
      return {
        success: false,
        transcript: '',
        reply:
          "Je n'ai pas entendu votre demande.",
      };
    }

    // ========================================
    // CONVERSATION
    // ========================================

    const conversationStart =
      Date.now();

    const conversation =
      await this.conversationManager.process(
        transcript,
        'asterisk-mvp-001',
      );

    const conversationTime =
      (
        (Date.now() - conversationStart) /
        1000
      ).toFixed(2);

    console.log(
      `⏱️ Conversation terminée : ${conversationTime} s`,
    );

    console.log(
      `💬 REPONSE : ${conversation.reply}`,
    );

    // ========================================
    // TTS
    // ========================================

    const ttsStart = Date.now();

    const reply =
      conversation.reply ??
      "Je suis désolé, je n'ai pas de réponse.";

    const ttsFile =
      await this.aiService.synthesize(
        reply,
        'ai-response.wav',
      );

    const ttsTime =
      (
        (Date.now() - ttsStart) /
        1000
      ).toFixed(2);

    console.log(
      `⏱️ TTS terminé : ${ttsTime} s`,
    );

    // ========================================
    // TOTAL
    // ========================================

    const totalTime =
      (
        (Date.now() - totalStart) /
        1000
      ).toFixed(2);

    console.log(
      '==========================================',
    );

    console.log(
      `⏱️ TOTAL : ${totalTime} s`,
    );

    console.log(
      '==========================================',
    );

    return {
      success: true,
      transcript,
      reply,
      ttsFile,
      timings: {
        stt: `${sttTime} s`,
        conversation:
          `${conversationTime} s`,
        tts:
          `${ttsTime} s`,
        total:
          `${totalTime} s`,
      },
      conversation,
    };
  }
}
