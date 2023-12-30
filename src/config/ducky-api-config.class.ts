import { Transform, TransformFnParams, Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Min,
  NotContains,
  Validate,
  ValidateIf,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { DnsCheckMxRecord } from 'src/domains/class/dns.class'

const jsonParse = (value: any): any => {
  try {
    return JSON.parse(value)
  } catch (error) {
    return value
  }
}

@ValidatorConstraint({ name: 'customBaseurlIfDuckpanel', async: false })
class CustomBaseurlIfDuckpanel implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments): boolean {
    const config = args.object as DuckyApiConfig
    if (config.SERVE_DUCKYPANEL) {
      return text !== ''
    } else {
      return true
    }
  }

  defaultMessage(): string {
    return 'You need to specify a custom BASE_URL when SERVE_DUCKYPANEL is set to true'
  }
}

export class DuckyApiConfig {
  @IsNotEmpty()
  @IsString()
  @Matches(new RegExp('^(development|production|test|provision)$'))
  NODE_ENV: 'development' | 'production' | 'test' | 'provision' = 'development'

  @Transform(jsonParse, { toClassOnly: true })
  @IsNumber()
  PORT = 3000

  @Transform(jsonParse, { toClassOnly: true })
  @IsBoolean()
  SERVE_DUCKYPANEL = false

  @Transform((value: any) => {
    // Remove leading and trailing slash
    if (value.endsWith('/')) {
      value = value.slice(0, -1)
    }
    if (value.startsWith('/')) {
      value = value.slice(1)
    }
    return value
  })
  @IsString()
  @Validate(CustomBaseurlIfDuckpanel)
  BASE_URL = '/'

  @IsNotEmpty()
  @IsString()
  @NotContains('CHANGE-ME-PLEASE!', {
    message: 'Set TOKEN_SECRET to something safe and random!',
  })
  TOKEN_SECRET: string

  @IsNotEmpty()
  @IsString()
  MONGODB_URL: string

  @IsNotEmpty()
  @IsString()
  REDIS_URL: string

  @IsNotEmpty()
  @IsString()
  @IsUrl({ require_tld: false })
  WILDDUCK_API_URL: string

  @IsString()
  @IsOptional()
  WILDDUCK_API_TOKEN = ''

  @Transform(jsonParse, { toClassOnly: true })
  @IsBoolean()
  ALLOW_UNSAFE_ACCOUNT_PASSWORDS = true

  @Transform(jsonParse, { toClassOnly: true })
  @IsBoolean()
  ALLOW_FORWARDER_WILDCARD = true

  @Transform(jsonParse, { toClassOnly: true })
  @IsBoolean()
  ALLOW_ACCOUNT_WILDCARD = true

  @Transform(jsonParse, { toClassOnly: true })
  @IsBoolean()
  QUEUE_UI = false

  @ValidateIf((config: DuckyApiConfig) => config.QUEUE_UI === true)
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  QUEUE_UI_USER?: string

  @ValidateIf((config: DuckyApiConfig) => config.QUEUE_UI === true && config.QUEUE_UI_USER !== undefined)
  @IsNotEmpty()
  @IsString()
  QUEUE_UI_PASSWORD: string

  @Transform(jsonParse, { toClassOnly: true })
  @Type(() => DnsCheckMxRecord)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested()
  MX_RECORDS: DnsCheckMxRecord[]

  @IsNotEmpty()
  @IsString()
  SPF_CORRECT_VALUE: string

  @IsOptional()
  @IsString()
  SPF_REGEX: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  DEFAULT_DKIM_SELECTOR: string

  @Transform(jsonParse, { toClassOnly: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  DELAY: number
}
