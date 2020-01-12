import { ApiModelProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

import { CreateUpdateAccountCommonDto } from './create-update-common.dto'

export class UpdateAccountDto extends CreateUpdateAccountCommonDto {
  @ApiModelProperty({ example: 'verysecret', description: 'The new password of the email account', required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  public password?: string

  @ApiModelProperty({
    example: false,
    description: 'If true then the account can not authenticate or receive any new mail',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  public disabled?: boolean
}
