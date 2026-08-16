import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConversationDto {

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({
    example: 'Je cherche un alternateur bosch pour une clio 4',
  })
  @IsString()
  message: string;

}
