import { ApiModelProperty } from "@nestjs/swagger"
import { Account } from "./account.class"

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
}
