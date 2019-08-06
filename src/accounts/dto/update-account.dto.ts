import { CreateUpdateCommonDto } from "./create-update-common.dto"
import { ApiModelProperty } from "@nestjs/swagger"
import { IsBoolean, IsOptional, IsNotEmpty, IsString } from "class-validator"

export class UpdateAccountDto extends CreateUpdateCommonDto {
  @ApiModelProperty({ example: "verysecret", description: "The new password of the email account", required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  public password: string

  @ApiModelProperty({
    example: false,
    description: "If true then the account can not authenticate or receive any new mail",
    required: false
  })
  @IsOptional()
  @IsBoolean()
  public disabled: boolean
}
