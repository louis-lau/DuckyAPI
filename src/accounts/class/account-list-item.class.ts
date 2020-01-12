import { ApiProperty } from '@nestjs/swagger'

import { Account } from './account.class'

class AccountListItemQuota {
  @ApiProperty({ example: 1073741824, description: 'How many bytes the account is allowed to use' })
  public allowed: number

  @ApiProperty({ example: 17799833, description: 'How many bytes the account is currently using' })
  public used: number
}

export class AccountListItem extends Account {
  @ApiProperty({ description: 'Account quota usage and limit' })
  public quota: AccountListItemQuota
}
