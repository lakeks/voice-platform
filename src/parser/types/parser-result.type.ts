export interface ParserResult {

  product?: string;

  brand?: string;

  vehicle?: {
    id: number;
    make: string;
    model: string;
    createdAt: Date;
  };

  words: string[];

  position?: number;

  quantity?: number;
}
