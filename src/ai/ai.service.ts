import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import WebSocket from 'ws';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly voiceId: string;

  private readonly ttsUrl =
    'wss://api.gradium.ai/api/speech/tts';

  constructor(
    private readonly configService: ConfigService,
  ) {
    const apiKey =
      this.configService.get<string>(
        'GRADIUM_API_KEY',
      );

    if (!apiKey) {
      throw new Error(
        'GRADIUM_API_KEY non configurée.',
      );
    }

    this.apiKey = apiKey;

    this.voiceId =
      this.configService.get<string>(
        'GRADIUM_VOICE_ID',
      ) ??
      'YTpq7expH9539ERJ';
  }

  /**
   * ==========================================
   * TTS GRADIUM WEBSOCKET
   * ==========================================
   *
   * Génère un fichier WAV avec Gradium.
   *
   * Le texte est envoyé au serveur par WebSocket
   * et les morceaux audio sont reçus au fur et
   * à mesure.
   */
  async synthesize(
    text: string,
    fileName = 'gradium-test.wav',
  ): Promise<string> {

    if (
      !text ||
      !text.trim()
    ) {
      throw new Error(
        'Le texte à synthétiser est vide.',
      );
    }

    const audioChunks: Buffer[] = [];

    return new Promise(
      (resolve, reject) => {

        let finished = false;

        const ws =
          new WebSocket(
            this.ttsUrl,
            {
              headers: {
                'x-api-key':
                  this.apiKey,
              },
            },
          );

        const fail =
          (error: Error) => {

            if (finished) {
              return;
            }

            finished = true;

            try {
              ws.close();
            } catch {}

            reject(error);
          };

        ws.on(
          'open',
          () => {

            console.log(
              'Gradium TTS WebSocket connecté.',
            );

            // ==================================
            // CONFIGURATION
            // ==================================

            ws.send(
              JSON.stringify({
                type: 'setup',
                voice_id:
                  this.voiceId,
                model_name:
                  'default',
                output_format:
                  'wav',
              }),
            );
          },
        );

        ws.on(
          'message',
          async (data) => {

            try {

              const message =
                JSON.parse(
                  data.toString(),
                );

              console.log(
                'Gradium TTS:',
                message.type,
              );

              // -------------------------------
              // SERVEUR PRÊT
              // -------------------------------

              if (
                message.type ===
                'ready'
              ) {

                ws.send(
                  JSON.stringify({
                    type: 'text',
                    text:
                      text.trim(),
                  }),
                );

                ws.send(
                  JSON.stringify({
                    type:
                      'end_of_stream',
                  }),
                );
              }

              // -------------------------------
              // AUDIO
              // -------------------------------

              if (
                message.type ===
                'audio'
              ) {

                if (
                  message.audio
                ) {

                  audioChunks.push(
                    Buffer.from(
                      message.audio,
                      'base64',
                    ),
                  );
                }
              }

              // -------------------------------
              // ERREUR
              // -------------------------------

              if (
                message.type ===
                'error'
              ) {

                fail(
                  new Error(
                    message.message ??
                      'Erreur Gradium TTS.',
                  ),
                );

                return;
              }

              // -------------------------------
              // FIN
              // -------------------------------

              if (
                message.type ===
                'end_of_stream'
              ) {

                if (finished) {
                  return;
                }

                finished = true;

                try {
                  ws.close();
                } catch {}

                const audioBuffer =
                  Buffer.concat(
                    audioChunks,
                  );

                const audioDirectory =
                  join(
                    process.cwd(),
                    'audio',
                  );

                await fs.mkdir(
                  audioDirectory,
                  {
                    recursive: true,
                  },
                );

                const safeFileName =
                  fileName.replace(
                    /[^a-zA-Z0-9._-]/g,
                    '_',
                  );

                const filePath =
                  join(
                    audioDirectory,
                    safeFileName,
                  );

                await fs.writeFile(
                  filePath,
                  audioBuffer,
                );

                console.log(
                  'TTS fichier créé :',
                  filePath,
                );

                console.log(
                  'TTS taille :',
                  audioBuffer.length,
                  'octets',
                );

                resolve(
                  filePath,
                );
              }

            } catch (
              error
            ) {

              fail(
                error instanceof Error
                  ? error
                  : new Error(
                      String(error),
                    ),
              );
            }
          },
        );

        ws.on(
          'error',
          (error) => {

            console.error(
              'Gradium TTS WebSocket erreur :',
              error,
            );

            fail(error);
          },
        );

        ws.on(
          'close',
          () => {

            if (
              !finished
            ) {

              // Si la connexion se ferme
              // avant le message final,
              // on considère cela comme
              // une erreur.

              fail(
                new Error(
                  'Connexion Gradium TTS fermée avant la fin.',
                ),
              );
            }
          },
        );
      },
    );
  }

  /**
   * ==========================================
   * TEST TTS
   * ==========================================
   */
  async test(): Promise<string> {

    return this.synthesize(
      "Bonjour, vous êtes bien chez Autopoint. Que puis-je faire pour vous aujourd'hui ?",
      'gradium-test.wav',
    );
  }
}
