import { ApiModelProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import {
  ArrayUnique,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested
} from "class-validator"
import { maxLimits } from "src/constants"

class CreateUpdateAccountLimits {
  @ApiModelProperty({
    example: 1073741824,
    description: "How many bytes the account is allowed to use",
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(maxLimits.quota ? 1 : 0) // If limit is defined don't allow 0, as that means no limit for WildDuck
  @Max(maxLimits.quota ? maxLimits.quota : Infinity) // If limit is defined set max, else no max
  public quota?: number

  @ApiModelProperty({
    example: 200,
    description: "How many emails the account can send in a period",
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(maxLimits.send ? 1 : 0)
  @Max(maxLimits.send ? maxLimits.send : Infinity)
  public send?: number

  @ApiModelProperty({
    example: 1000,
    description: "How many emails the account can receive in a period",
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(maxLimits.receive ? 1 : 0)
  @Max(maxLimits.receive ? maxLimits.receive : Infinity)
  public receive?: number

  @ApiModelProperty({
    example: 100,
    description: "How many emails the account can forward in a period",
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(maxLimits.forward ? 1 : 0)
  @Max(maxLimits.forward ? maxLimits.forward : Infinity)
  public forward?: number
}

export class CreateUpdateAccountCommonDto {
  @ApiModelProperty({ example: "John Doe", description: "The name of the email account", required: false })
  @IsOptional()
  @IsString()
  public name?: string

  @ApiModelProperty({
    example: 50,
    description: "Relative scale for detecting spam. 0 means that everything is spam, 100 means that nothing is spam",
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  public spamLevel?: number

  @ApiModelProperty({ description: "Account limits" })
  @IsOptional()
  @ValidateNested()
  @Type((): typeof CreateUpdateAccountLimits => CreateUpdateAccountLimits)
  public limits?: CreateUpdateAccountLimits = {}

  @ApiModelProperty({
    example: ["imap", "pop3"],
    description: "List of scopes that are disabled for this user",
    required: false
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Matches(new RegExp("^(pop3|imap|smtp)$"), {
    each: true,
    message: "each value in disabledScopes must be either pop3, imap, smtp"
  })
  public disabledScopes?: ("pop3" | "imap" | "smtp")[]
}
