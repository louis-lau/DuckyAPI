import { ApiModelProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

import { CreateUpdateCommonDto } from "./create-update-common.dto"

export class CreateAccountDto extends CreateUpdateCommonDto {
  @ApiModelProperty({ example: "john@example.com", description: "The E-Mail address of the email account" })
  @IsEmail()
  public address: string

  @ApiModelProperty({ example: "verysecret", description: "The new password of the email account" })
  @IsNotEmpty()
  @IsString()
  public password: string
}
