import { ApiModelProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class CreateUserDto {
  @ApiModelProperty({
    example: "johndoe",
    description: "The username for this user"
  })
  @IsNotEmpty()
  @IsString()
  public username: string

  @ApiModelProperty({
    example: "supersecret",
    description: "The password for this user"
  })
  @IsNotEmpty()
  @IsString()
  public password: string
}
