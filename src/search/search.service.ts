import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async search(filters: {
    product?: string;
    brand?: string;
  }) {
    return this.prisma.inventoryItem.findMany({
      where: {
        ...(filters.product && {
          productType: {
            equals: filters.product,
            mode: 'insensitive',
          },
        }),

        ...(filters.brand && {
          brand: {
            equals: filters.brand,
            mode: 'insensitive',
          },
        }),
      },

      orderBy: {
        quantity: 'desc',
      },
    });
  }
}
