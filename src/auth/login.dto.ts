import { ApiModelProperty } from "@nestjs/swagger"

export class LoginDto {
  @ApiModelProperty({ example: "johndoe", description: "Username of the user you want to login as" })
  public username: string

  @ApiModelProperty({ example: "supersecret", description: "Password of the user you want to login as" })
  public password: string
}
