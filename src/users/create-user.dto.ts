import { ApiModelProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class CreateUserDto {
  @ApiModelProperty({ example: "johndoe", description: "The username for this user" })
  @IsString()
  public username: string

  @ApiModelProperty({ example: "supersecret", description: "The password for this user" })
  @IsString()
  public password: string
}
