import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsOptional } from 'class-validator'

import { CreateUpdateForwarderCommonDto } from './create-update-forwarder-common.dto'

export class UpdateForwarderDto extends CreateUpdateForwarderCommonDto {
  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'The E-Mail address that should be forwarded',
  })
  @IsOptional()
  @IsEmail()
  public address: string
}
