import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, NotContains } from 'class-validator'

import { CreateUpdateAccountCommonDto } from './create-update-common.dto'

export class CreateAccountDto extends CreateUpdateAccountCommonDto {
  @ApiProperty({ example: 'john@example.com', description: 'The E-Mail address of the email account' })
  @IsEmail()
  @NotContains('*')
  public address: string

  @ApiProperty({ example: 'verysecret', description: 'The new password of the email account' })
  @IsNotEmpty()
  @IsString()
  public password: string
}
