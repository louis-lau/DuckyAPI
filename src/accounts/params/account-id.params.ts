import { ApiModelProperty } from '@nestjs/swagger'
import { IsMongoId } from 'class-validator'

export class AccountIdParams {
  @ApiModelProperty({ description: 'Unique id of the account' })
  @IsMongoId()
  public accountId: string
}
