import { ApiModelProperty } from '@nestjs/swagger'
import { IsEmail } from 'class-validator'

import { CreateUpdateForwarderCommonDto } from './create-update-forwarder-common.dto'

export class CreateForwarderDto extends CreateUpdateForwarderCommonDto {
  @ApiModelProperty({ example: 'john@example.com', description: 'The E-Mail address that should be forwarded' })
  @IsEmail()
  public address: string
}
