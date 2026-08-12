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

}
