import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId } from 'class-validator'

import { AccountIdParams } from './account-id.params'

export class AccountAliasParams extends AccountIdParams {
  @ApiProperty({ description: 'Unique id of the alias' })
  @IsMongoId()
  public aliasId: string
}
