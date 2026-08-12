import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConversationDto {

  @ApiProperty({
    example: 'call-123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({
    example: 'je cherche un alternateur bosch pour une clio 4',
  })
  @IsString()
  message: string;

}
