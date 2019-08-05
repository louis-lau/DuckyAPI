import { ApiModelProperty } from "@nestjs/swagger"
import {
  IsOptional,
  IsString,
  IsEmail,
  IsNumber,
  Min,
  Max,
  IsPositive,
  Matches,
  IsArray,
  ArrayUnique,
  IsNotEmpty
} from "class-validator"

export class CreateAccountDto {
  @ApiModelProperty({ example: "John Doe", description: "The name of the email account", required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  public name: string | null

  @ApiModelProperty({ example: "john@example.com", description: "The E-Mail address of the email account" })
  @IsEmail()
  public address: string

  @ApiModelProperty({ example: "verysecret", description: "The new password of the email account" })
  @IsNotEmpty()
  @IsString()
  public password: string

  @ApiModelProperty({
    example: 50,
    description: "Relative scale for detecting spam. 0 means that everything is spam, 100 means that nothing is spam",
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  public spamLevel: number

  @ApiModelProperty({
    example: 1073741824,
    description: "How many bytes the account is allowed to use",
    required: false
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  public quotaAllowed: number | null

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
  public disabledScopes: ("pop3" | "imap" | "smtp")[]
}
