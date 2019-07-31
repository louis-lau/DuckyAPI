import { ApiModelProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @ApiModelProperty({ example: "johndoe", description: "Username of the user you want to login as" })
  @IsNotEmpty()
  @IsString()
  public username: string

  @ApiModelProperty({ example: "supersecret", description: "Password of the user you want to login as" })
  @IsNotEmpty()
  @IsString()
  public password: string
}
