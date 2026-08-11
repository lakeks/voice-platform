import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  create(createInventoryDto: CreateInventoryDto) {
    return this.prisma.inventoryItem.create({
      data: createInventoryDto,
    });
  }

  findAll() {
    return this.prisma.inventoryItem.findMany({
      include: {
        store: true,
      },
    });
  }

  async search(query: string) {
    const words = query.trim().split(/\s+/);

    const items = await this.prisma.inventoryItem.findMany({
      where: {
        AND: words.map((word) => ({
          OR: [
            {
              label: {
                contains: word,
                mode: 'insensitive',
              },
            },
            {
              brand: {
                contains: word,
                mode: 'insensitive',
              },
            },
            {
              sku: {
                contains: word,
                mode: 'insensitive',
              },
            },
          ],
        })),
      },
      include: {
        store: true,
      },
    });

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
      speech: `Oui, nous avons ${item.label} en stock. Il nous en reste ${item.quantity}. Le prix est de ${item.price} francs.`,
      item,
    };
  }
  async findItems(query: string) {
  const words = query.trim().split(/\s+/);

  return this.prisma.inventoryItem.findMany({
    where: {
      AND: words.map((word) => ({
        OR: [
          {
            label: {
              contains: word,
              mode: 'insensitive',
            },
          },
          {
            brand: {
              contains: word,
              mode: 'insensitive',
            },
          },
          {
            sku: {
              contains: word,
              mode: 'insensitive',
            },
          },
        ],
      })),
    },
    include: {
      store: true,
    },
  });
}
  findOne(id: number) {
    return this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });
  }

  update(id: number, updateInventoryDto: UpdateInventoryDto) {
    return this.prisma.inventoryItem.update({
      where: { id },
      data: updateInventoryDto,
    });
  }

  remove(id: number) {
    return this.prisma.inventoryItem.delete({
      where: { id },
    });
  }
}
