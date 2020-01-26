import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayUnique,
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'

class CreateUpdateAccountLimits {
  @ApiProperty({
    example: 1073741824,
    description: 'How many bytes the account is allowed to use',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  public quota?: number

  @ApiProperty({
    example: 200,
    description: 'How many emails the account can send in a period',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  public send?: number

  @ApiProperty({
    example: 1000,
    description: 'How many emails the account can receive in a period',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  public receive?: number

  @ApiProperty({
    example: 100,
    description: 'How many emails the account can forward in a period',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  public forward?: number
}

export class CreateUpdateAccountCommonDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the email account', required: false })
  @IsOptional()
  @IsString()
  public name?: string

  @ApiProperty({
    example: 50,
    description: 'Relative scale for detecting spam. 0 means that everything is spam, 100 means that nothing is spam',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  public spamLevel?: number

  @ApiProperty({ description: 'Account limits' })
  @IsOptional()
  @ValidateNested()
  @Type((): typeof CreateUpdateAccountLimits => CreateUpdateAccountLimits)
  public limits?: CreateUpdateAccountLimits = {}

  @ApiProperty({
    example: ['imap', 'pop3'],
    description: 'List of scopes that are disabled for this user',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Matches(new RegExp('^(pop3|imap|smtp)$'), {
    each: true,
    message: 'each value in disabledScopes must be either pop3, imap, smtp',
  })
  public disabledScopes?: ('pop3' | 'imap' | 'smtp')[]
}
