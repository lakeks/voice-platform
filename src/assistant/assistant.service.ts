import { Injectable } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class AssistantService {
  constructor(
    private readonly inventoryService: InventoryService,
  ) {}

  async answer(question: string) {
    const items = await this.inventoryService.findItems(question);

    if (items.length === 0) {
      return {
        success: false,
        speech:
          "Je suis désolé, je n'ai trouvé aucune pièce correspondant à votre recherche.",
      };
    }

    const item = items[0];

    return {
      success: true,
      speech: `Oui, nous avons ${item.label} en stock. Il nous en reste ${item.quantity}. Son prix est de ${item.price} francs CFP.`,
      item,
    };
  }
}
