import { Transform, Type } from 'class-transformer'
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
  ValidateIf,
  ValidateNested,
} from 'class-validator'
import { DnsCheckMxRecord } from 'src/domains/class/dns.class'

const jsonParse = (value: any): any => {
  try {
    return JSON.parse(value)
  } catch (error) {
    return value
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

  @Transform((value: string) => (value.endsWith('/') ? value.slice(0, -1) : value)) // Remove trailing slash
  @IsString()
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
  @IsUrl()
  WILDDUCK_API_URL: string

  @IsNotEmpty()
  @IsString()
  WILDDUCK_API_TOKEN: string

  @Transform(jsonParse, { toClassOnly: true })
  @IsBoolean()
  ALLOW_UNSAFE_ACCOUNT_PASSWORDS = true

  @Transform(jsonParse, { toClassOnly: true })
  @IsBoolean()
  ALLOW_FORWARDER_WILDCARD = true

  @Transform(jsonParse, { toClassOnly: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  MAX_QUOTA: number

  @Transform(jsonParse, { toClassOnly: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  MAX_SEND: number

  @Transform(jsonParse, { toClassOnly: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  MAX_FORWARD: number

  @Transform(jsonParse, { toClassOnly: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  MAX_RECEIVE: number

  @Transform(jsonParse, { toClassOnly: true })
  @IsBoolean()
  ARENA_ENABLED = false

  @ValidateIf((config: DuckyApiConfig) => config.ARENA_ENABLED === true)
  @IsNotEmpty()
  @IsString()
  ARENA_USER: string

  @ValidateIf((config: DuckyApiConfig) => config.ARENA_ENABLED === true)
  @IsNotEmpty()
  @IsString()
  ARENA_PASSWORD: string

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

  @Transform(jsonParse, { toClassOnly: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  DELAY: number
}
