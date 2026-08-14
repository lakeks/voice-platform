import { Injectable } from '@nestjs/common';

@Injectable()
export class ConversationResponseService {

  buildSearchResult(
    vehicle: string,
    label: string,
    quantity: number,
    price: number | null,
  ): string {

    const displayPrice = price ?? 0;

    return `J'ai trouvé ${label} compatible avec votre ${vehicle}. Il reste ${quantity} exemplaire(s) en stock au prix de ${displayPrice} F CFP.`;

  }

  buildResultList(
    vehicle: string,
    results: any[],
  ): string {

    const lines: string[] = [];

    const max = Math.min(results.length, 5);

    for (let i = 0; i < max; i++) {

      const item = results[i];

      lines.push(
        `${i + 1}. ${item.label} — ${item.price ?? 0} F CFP`,
      );

    }

    return (
      `J'ai trouvé ${results.length} pièce(s) compatible(s) avec votre ${vehicle}.\n\n` +
      lines.join('\n') +
      `\n\nVous pouvez maintenant me dire :\n` +
      `• le premier\n` +
      `• le deuxième\n` +
      `• le moins cher\n` +
      `• le plus cher\n` +
      `• je préfère Bosch`
    );

  }

}
