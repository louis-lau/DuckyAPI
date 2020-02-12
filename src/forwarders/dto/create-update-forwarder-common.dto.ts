import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
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
  @ApiPropertyOptional({ example: 600, description: 'How many messages can be forwarded per period' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  public forward?: number
}

export class CreateUpdateForwarderCommonDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Identity name' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  public name?: string

  @ApiPropertyOptional({
    example: ['johndoe@example.com', 'smtp://mx.example.com:25', 'https://example.com'],
    description:
      'An array of forwarding targets. The value could either be an email address or a relay url to next MX server ("smtp://mx2.zone.eu:25") or an URL where mail contents are POSTed to',
    type: [String],
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
