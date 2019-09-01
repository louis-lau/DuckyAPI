import { ApiModelProperty } from "@nestjs/swagger"
import { IsBoolean,IsNotEmpty, IsOptional, IsString } from "class-validator"

export class LoginDto {
  @ApiModelProperty({ example: "johndoe", description: "Username of the user you want to login as" })
  @IsNotEmpty()
  @IsString()
  public username: string

  @ApiModelProperty({ example: "supersecret", description: "Password of the user you want to login as" })
  @IsNotEmpty()
  @IsString()
  public password: string

  @ApiModelProperty({ example: false, description: "Makes the token have a longer expiry time", required: false })
  @IsOptional()
  @IsBoolean()
  public rememberMe?: boolean
}
