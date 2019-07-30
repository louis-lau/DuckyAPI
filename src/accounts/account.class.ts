import { ApiModelProperty } from "@nestjs/swagger"

export class Account {
  @ApiModelProperty({ example: "59cb948ad80a820b68f05230", description: "The unique id of the email account" })
  public id: string

  @ApiModelProperty({ example: "John Doe", description: "The name of the email account" })
  public name: string | null

  @ApiModelProperty({ example: "john@example.com", description: "The E-Mail address of the email account" })
  public address: string

  @ApiModelProperty({ example: 1073741824, description: "How many bytes the account is allowed to use" })
  public quotaAllowed: number

  @ApiModelProperty({ example: 17799833, description: "How many bytes the account is currently using" })
  public quotaUsed: number

  @ApiModelProperty({
    example: false,
    description: "If true then the account can not authenticate or receive any new mail"
  })
  public disabled: boolean
}
