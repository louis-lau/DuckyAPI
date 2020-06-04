import { ApiProperty } from '@nestjs/swagger'

import { Address } from './address.class'

export class Account extends Address {
  @ApiProperty({
    example: false,
    description: 'If true then the account can not authenticate or receive any new mail',
  })
  public disabled: boolean

  @ApiProperty({
    description: 'List of aliases for this account',
    type: Address,
    isArray: true,
  })
  public aliases: Address[]
}
