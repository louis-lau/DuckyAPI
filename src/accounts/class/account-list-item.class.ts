import { ApiModelProperty } from "@nestjs/swagger"

import { Account } from "./account.class"

class AccountListItemQuota {
  @ApiModelProperty({ example: 1073741824, description: "How many bytes the account is allowed to use" })
  public allowed: number

  @ApiModelProperty({ example: 17799833, description: "How many bytes the account is currently using" })
  public used: number
}

export class AccountListItem extends Account {
  @ApiModelProperty({ description: "Account quota usage and limit" })
  public quota: AccountListItemQuota
}
