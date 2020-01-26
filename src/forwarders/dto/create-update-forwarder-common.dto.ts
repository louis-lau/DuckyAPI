import { Inject } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator'
import { EachIsEmailOrHttpOrSmtp } from 'src/common/is-email-or-url.validator'

class CreateUpdateForwarderCommonDtoLimits {
  @ApiProperty({ example: 600, description: 'How many messages can be forwarded per period', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  public forward?: number
}

export class CreateUpdateForwarderCommonDto {
  @ApiProperty({ example: 'John Doe', description: 'Identity name', required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  public name?: string

  @ApiProperty({
    example: ['johndoe@example.com', 'smtp://mx.example.com:25', 'https://example.com'],
    description:
      'An array of forwarding targets. The value could either be an email address or a relay url to next MX server ("smtp://mx2.zone.eu:25") or an URL where mail contents are POSTed to',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  @Validate(EachIsEmailOrHttpOrSmtp)
  public targets?: string[]

  @ApiProperty({ description: 'Limits for this forwarder' })
  @ValidateNested()
  @Type((): typeof CreateUpdateForwarderCommonDtoLimits => CreateUpdateForwarderCommonDtoLimits)
  public limits?: CreateUpdateForwarderCommonDtoLimits
}
