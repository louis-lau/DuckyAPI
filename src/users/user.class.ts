import { ApiModelProperty } from "@nestjs/swagger"

export class User {
  @ApiModelProperty({ example: "johndoe", description: "The username for this user" })
  public username: string

  @ApiModelProperty({ example: "supersecret", description: "The password for this user" })
  public password: string

  @ApiModelProperty({
    example: "2012-04-23T18:25:43.511Z",
    description: "The date after which we should consider a jwt token valid fpr this user"
  })
  public minTokenDate: Date
}
