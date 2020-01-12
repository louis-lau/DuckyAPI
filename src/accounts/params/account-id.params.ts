import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId } from 'class-validator'

export class AccountIdParams {
  @ApiProperty({ description: 'Unique id of the account' })
  @IsMongoId()
  public accountId: string
}
