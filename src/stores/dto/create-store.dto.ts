import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({
    example: 'Auto Pièces Nouméa',
    description: 'Nom du magasin',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: '+687284567',
    description: 'Téléphone du magasin',
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}
