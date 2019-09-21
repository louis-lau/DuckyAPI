import { ApiModelProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidateNested
} from "class-validator"
import { EachIsEmailOrHttpOrSmtp } from "src/common/is-email-or-url.validator"
import { maxLimits } from "src/constants"

class CreateUpdateForwarderCommonDtoLimits {
  @ApiModelProperty({ example: 600, description: "How many messages can be forwarded per period", required: false })
  @IsOptional()
  @IsNumber()
  @Min(maxLimits.forward ? 1 : 0)
  @Max(maxLimits.forward ? maxLimits.forward : Infinity)
  public forward?: number
}

export class CreateUpdateForwarderCommonDto {
  @ApiModelProperty({ example: "John Doe", description: "Identity name", required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  public name?: string

  @ApiModelProperty({
    example: ["johndoe@example.com", "smtp://mx.example.com:25", "https://example.com"],
    description:
      'An array of forwarding targets. The value could either be an email address or a relay url to next MX server ("smtp://mx2.zone.eu:25") or an URL where mail contents are POSTed to',
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  @Validate(EachIsEmailOrHttpOrSmtp)
  public targets?: string[]

  @ApiModelProperty({ description: "Limits for this forwarder" })
  @ValidateNested()
  @Type((): typeof CreateUpdateForwarderCommonDtoLimits => CreateUpdateForwarderCommonDtoLimits)
  public limits?: CreateUpdateForwarderCommonDtoLimits
}
