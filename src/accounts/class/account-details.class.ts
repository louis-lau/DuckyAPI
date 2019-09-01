import { ApiModelProperty } from "@nestjs/swagger"

import { Account } from "./account.class"

class AccountDetailsLimitsQuota {
  @ApiModelProperty({ example: 1073741824, description: "How many bytes the account is allowed to use" })
  public allowed: number

  @ApiModelProperty({ example: 2048, description: "How many bytes the account is currently using" })
  public used: number
}

class AccountDetailsLimitsSend {
  @ApiModelProperty({ example: 200, description: "How many messages can be sent per period" })
  public allowed: number

  @ApiModelProperty({ example: 231, description: "How many messages were sent in the current period" })
  public used: number

  @ApiModelProperty({ example: 3600, description: "Seconds until the end of the current period" })
  public ttl: number
}

class AccountDetailsLimitsReceive {
  @ApiModelProperty({ example: 1000, description: "How many messages can be received per period" })
  public allowed: number

  @ApiModelProperty({ example: 574, description: "How many messages were received in the current period" })
  public used: number

  @ApiModelProperty({ example: 3600, description: "Seconds until the end of the current period" })
  public ttl: number
}

class AccountDetailsLimitsForward {
  @ApiModelProperty({ example: 100, description: "How many messages can be forwarded per period" })
  public allowed: number

  @ApiModelProperty({ example: 56, description: "How many messages were forwarded in the current period" })
  public used: number

  @ApiModelProperty({ example: 3600, description: "Seconds until the end of the current period" })
  public ttl: number
}

class AccountDetailsLimits {
  @ApiModelProperty({ description: "Storage quota limit and usage" })
  public quota: AccountDetailsLimitsQuota

  @ApiModelProperty({ description: "How many emails the account can send in a period" })
  public send: AccountDetailsLimitsSend

  @ApiModelProperty({ description: "How many emails the account can receive in a period" })
  public receive: AccountDetailsLimitsReceive

  @ApiModelProperty({ description: "How many emails the account can forward in a period" })
  public forward: AccountDetailsLimitsForward
}

export class AccountDetails extends Account {
  @ApiModelProperty({
    example: 50,
    description: "Relative scale for detecting spam. 0 means that everything is spam, 100 means that nothing is spam"
  })
  public spamLevel: number

  @ApiModelProperty({
    example: ["imap", "pop3"],
    description: "List of scopes that are disabled for this user"
  })
  public disabledScopes: ("pop3" | "imap" | "smtp")[]

  @ApiModelProperty({ description: "Account limits" })
  public limits: AccountDetailsLimits
}
