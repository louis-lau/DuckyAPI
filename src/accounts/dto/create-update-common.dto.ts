import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
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

export class CreateUpdateAccountLimits {
  @ApiPropertyOptional({
    example: 1073741824,
    description: 'How many bytes the account is allowed to use',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  public quota?: number

  @ApiPropertyOptional({
    example: 200,
    description: 'How many emails the account can send in a period',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  public send?: number

  @ApiPropertyOptional({
    example: 1000,
    description: 'How many emails the account can receive in a period',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  public receive?: number

  @ApiPropertyOptional({
    example: 100,
    description: 'How many emails the account can forward in a period',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  public forward?: number
}

export class CreateUpdateAccountCommonDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'The name of the email account' })
  @IsOptional()
  @IsString()
  public name?: string

  @ApiPropertyOptional({
    example: 50,
    description: 'Relative scale for detecting spam. 0 means that everything is spam, 100 means that nothing is spam',
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

  @ApiPropertyOptional({
    example: ['imap', 'pop3'],
    description: 'List of scopes that are disabled for this user',
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
