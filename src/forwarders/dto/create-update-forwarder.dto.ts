import { ApiModelProperty } from "@nestjs/swagger"
import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Validate
} from "class-validator"
import { EachIsEmailOrHttpOrSmtp } from "src/common/is-email-or-url.validator"
import { maxLimits } from "src/constants"

export class CreateUpdateForwarderDto {
  @ApiModelProperty({ example: "john@example.com", description: "The E-Mail address that should be forwarded" })
  @IsEmail()
  public address: string

  @ApiModelProperty({ example: "John Doe", description: "Identity name", required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  public name?: string

  @ApiModelProperty({
    example: ["johndoe@example.com", "smtp://mx.example.com:25", "https://example.com"],
    description:
      'An array of forwarding targets. The value could either be an email address or a relay url to next MX server ("smtp://mx2.zone.eu:25") or an URL where mail contents are POSTed to',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  @Validate(EachIsEmailOrHttpOrSmtp)
  public targets: string[]

  @ApiModelProperty({ example: 600, description: "How many messages can be forwarded per period", required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(maxLimits.forward)
  public forwards?: number
}
