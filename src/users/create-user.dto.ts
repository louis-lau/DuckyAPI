import { ApiModelProperty } from "@nestjs/swagger"
import { IsAscii, IsNotEmpty, IsString, NotContains } from "class-validator"

export class CreateUserDto {
  @ApiModelProperty({
    example: "johndoe",
    description: "The username for this user"
  })
  @IsNotEmpty()
  @IsString()
  @IsAscii()
  @NotContains(" ", { message: "username must not contain spaces" })
  public username: string

  @ApiModelProperty({
    example: "supersecret",
    description: "The password for this user"
  })
  @IsNotEmpty()
  @IsString()
  public password: string
}
