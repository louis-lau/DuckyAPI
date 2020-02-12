import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

import { CreateUpdateAccountCommonDto } from './create-update-common.dto'

export class UpdateAccountDto extends CreateUpdateAccountCommonDto {
  @ApiPropertyOptional({ example: 'verysecret', description: 'The new password of the email account' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  public password?: string

  @ApiPropertyOptional({
    example: false,
    description: 'If true then the account can not authenticate or receive any new mail',
  })
  @IsOptional()
  @IsBoolean()
  public disabled?: boolean
}
