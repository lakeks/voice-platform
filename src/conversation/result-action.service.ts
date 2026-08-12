import { Injectable } from '@nestjs/common';

@Injectable()
export class ResultActionService {

  cheapest(results: any[]) {

    return results.reduce((a, b) => {

      const priceA = a.price ?? Number.MAX_SAFE_INTEGER;
      const priceB = b.price ?? Number.MAX_SAFE_INTEGER;

      return priceA < priceB ? a : b;

    });

  }

  mostExpensive(results: any[]) {

    return results.reduce((a, b) => {

      const priceA = a.price ?? 0;
      const priceB = b.price ?? 0;

      return priceA > priceB ? a : b;

    });

  }

}
