import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({
    example: 'ALT-001',
    description: 'Référence interne de la pièce',
  })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({
    example: 'Alternateur Valeo',
    description: 'Nom de la pièce',
  })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({
    example: 'Valeo',
    description: 'Marque',
    required: false,
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({
    example: 4,
    description: 'Quantité en stock',
  })
  @IsInt()
  @Min(0)
  quantity!: number;

  @ApiProperty({
    example: 24990,
    description: 'Prix en F CFP',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    example: 1,
    description: 'Identifiant du magasin',
  })
  @IsInt()
  storeId!: number;
}
