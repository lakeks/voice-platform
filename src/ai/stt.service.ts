import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import WebSocket from 'ws';
import { promises as fs } from 'fs';

@Injectable()
export class SttService {
  private readonly apiKey: string;
  private readonly sttUrl =
    'wss://api.gradium.ai/api/speech/asr';

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
  }

  /**
   * Transcrit un fichier audio WAV avec Gradium.
   *
   * Le fichier doit être :
   * - PCM
   * - mono
   * - 8000 Hz
   * - 16 bits
   */
  async transcribeFile(
    filePath: string,
  ): Promise<string> {

    const audio =
      await fs.readFile(filePath);

    return new Promise(
      (resolve, reject) => {

        const ws =
          new WebSocket(
            this.sttUrl,
            {
              headers: {
                'x-api-key':
                  this.apiKey,
              },
            },
          );

        let transcript = '';

        let finished = false;

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
              'Gradium STT connecté.',
            );

            // Configuration du flux STT
            ws.send(
              JSON.stringify({
                type: 'setup',
                model_name: 'default',
                input_format:
                  'pcm_8000',
                json_config: {
                  language: 'fr',
                },
              }),
            );

            // Attendre un court instant
            // puis envoyer l'audio.
            setTimeout(
              () => {

                const chunkSize =
                  1280;

                for (
                  let offset = 0;
                  offset < audio.length;
                  offset += chunkSize
                ) {

                  const chunk =
                    audio.subarray(
                      offset,
                      Math.min(
                        offset +
                          chunkSize,
                        audio.length,
                      ),
                    );

                  ws.send(
                    JSON.stringify({
                      type: 'audio',
                      audio:
                        chunk.toString(
                          'base64',
                        ),
                    }),
                  );
                }

                ws.send(
                  JSON.stringify({
                    type:
                      'end_of_stream',
                  }),
                );
              },
              100,
            );
          },
        );

        ws.on(
          'message',
          (data) => {

            try {

              const message =
                JSON.parse(
                  data.toString(),
                );

              console.log(
                'Gradium STT:',
                message,
              );

              if (
                message.type ===
                'text'
              ) {

                transcript +=
                  (
                    transcript
                      ? ' '
                      : ''
                  ) +
                  message.text;
              }

              if (
                message.type ===
                'end_of_stream'
              ) {

                if (
                  finished
                ) {
                  return;
                }

                finished = true;

                ws.close();

                resolve(
                  transcript.trim(),
                );
              }

              if (
                message.type ===
                'error'
              ) {

                fail(
                  new Error(
                    message.message ??
                      'Erreur Gradium STT.',
                  ),
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

            fail(error);

          },
        );

        ws.on(
          'close',
          () => {

            if (
              !finished
            ) {

              finished = true;

              resolve(
                transcript.trim(),
              );
            }

          },
        );
      },
    );
  }
}
