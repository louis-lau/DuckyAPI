import { ApiModelProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  ValidateIf,
  ValidateNested
} from "class-validator"
import { EachIsEmailOrHttpOrSmtp } from "src/common/is-email-or-url.validator"

import { Filter } from "../class/filter.class"

class Query {
  @ApiModelProperty({
    example: "John",
    description: "Partial match for the From: header (case insensitive)",
    required: false
  })
  @IsOptional()
  @IsString()
  public from?: string

  @ApiModelProperty({
    example: "John",
    description: "Partial match for the To:/Cc: headers (case insensitive)",
    required: false
  })
  @IsOptional()
  @IsString()
  public to?: string

  @ApiModelProperty({
    example: "You have 1 new notification",
    description: "Partial match for the Subject: header (case insensitive)",
    required: false
  })
  @IsOptional()
  @IsString()
  public subject?: string

  @ApiModelProperty({
    example: "John's list",
    description: "Partial match for the List-ID: header (case insensitive)",
    required: false
  })
  @IsOptional()
  @IsString()
  public listid?: string

  @ApiModelProperty({
    example: "Dedicated servers",
    description: "Fulltext search against message text",
    required: false
  })
  @IsOptional()
  @IsString()
  public text?: string

  @ApiModelProperty({
    example: false,
    description: "Does a message have to have an attachment or not",
    required: false,
    type: Boolean
  })
  @IsOptional()
  @ValidateIf((object, value): boolean => value !== "")
  @IsBoolean()
  public ha?: boolean | ""

  @ApiModelProperty({
    example: 1000,
    description:
      "Message size in bytes. If the value is a positive number then message needs to be larger, if negative then message needs to be smaller than abs(size) value",
    required: false,
    type: Number
  })
  @IsOptional()
  @ValidateIf((object, value): boolean => value !== "")
  @IsNumber()
  public size?: number | ""
}

class Action {
  @ApiModelProperty({
    example: true,
    description: "If true then mark matching messages as Seen",
    required: false,
    type: Boolean
  })
  @IsOptional()
  @ValidateIf((object, value): boolean => value !== "")
  @IsBoolean()
  public seen?: boolean | ""

  @ApiModelProperty({
    example: true,
    description: "If true then mark matching messages as Flagged",
    required: false,
    type: Boolean
  })
  @IsOptional()
  @ValidateIf((object, value): boolean => value !== "")
  @IsBoolean()
  public flag?: boolean | ""

  @ApiModelProperty({
    example: true,
    description: "If true then do not store matching messages",
    required: false,
    type: Boolean
  })
  @IsOptional()
  @ValidateIf((object, value): boolean => value !== "")
  @IsBoolean()
  public delete?: boolean | ""

  @ApiModelProperty({
    example: true,
    description: "If true then store matching messags to Junk Mail folder",
    required: false,
    type: Boolean
  })
  @IsOptional()
  @ValidateIf((object, value): boolean => value !== "")
  @IsBoolean()
  public spam?: boolean | ""

  @ApiModelProperty({
    example: "5a1c0ee490a34c67e266932c",
    description: "Mailbox ID to store matching messages to",
    required: false
  })
  @IsOptional()
  @IsMongoId()
  public mailbox?: string

  @ApiModelProperty({
    example: ["johndoe@example.com", "smtp://mx.example.com:25", "https://example.com"],
    description:
      'An array of forwarding targets. The value could either be an email address or a relay url to next MX server ("smtp://mx2.zone.eu:25") or an URL where mail contents are POSTed to',
    required: false,
    type: [String]
  })
  @IsOptional()
  @ValidateIf((object, value): boolean => value !== "")
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  @Validate(EachIsEmailOrHttpOrSmtp)
  public targets?: string[] | ""
}

export class CreateUpdateFilterDto extends Filter {
  @ApiModelProperty({ description: "Rules that a message must match" })
  @ValidateNested()
  @Type((): typeof Query => Query)
  public query: Query

  @ApiModelProperty({ description: "Rules that a message must match" })
  @ValidateNested()
  @Type((): typeof Action => Action)
  public action: Action
}
