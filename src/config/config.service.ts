import Joi from '@hapi/joi'
import dotenv from 'dotenv'
import fs from 'fs'
import { DnsCheckMxRecord } from 'src/domains/class/dns.class'

export type EnvConfig = Record<string, any>

// Use joi to coerce string to arrays and objects
const JoiCoerce: typeof Joi = Joi.extend({
  type: 'object',
  base: Joi.object(),
  coerce: {
    from: 'string',
    method(value): { value: any } {
      if (value[0] !== '{' && !/^\s*\{/.test(value)) {
        return
      }

      try {
        return { value: JSON.parse(value) }
      } catch (error) {
        console.error('Invalid JSON!')
        console.error(error)
      }
    },
  },
}).extend({
  type: 'array',
  base: Joi.array(),
  coerce: {
    from: 'string',
    method(value): { value: any } {
      if (typeof value !== 'string' || (value[0] !== '[' && !/^\s*\[/.test(value))) {
        return
      }

      try {
        return { value: JSON.parse(value) }
      } catch (error) {
        console.error('Invalid JSON!')
        console.error(error)
      }
    },
  },
})

export class ConfigService {
  private readonly envConfig: EnvConfig

  constructor(filePath: string) {
    const config = dotenv.parse(fs.readFileSync(filePath))
    this.envConfig = this.validateInput(config)
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = JoiCoerce.object({
      NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'provision')
        .default('development'),
      PORT: Joi.number().default(3000),
      BASE_URL: Joi.string().default('/'),
      TOKEN_SECRET: Joi.string()
        .disallow('CHANGE-ME-PLEASE!')
        .required(),
      MONGODB_URL: Joi.string().required(),
      REDIS_URL: Joi.string().required(),
      WILDDUCK_API_URL: Joi.string()
        .uri()
        .required(),
      WILDDUCK_API_TOKEN: Joi.string().required(),
      ALLOW_UNSAFE_ACCOUNT_PASSWORDS: Joi.boolean().default(true),
      ALLOW_FORWARDER_WILDCARD: Joi.boolean().default(true),
      MAX_QUOTA: Joi.number(),
      MAX_SEND: Joi.number(),
      MAX_FORWARD: Joi.number(),
      MAX_RECEIVE: Joi.number(),
      ARENA_ENABLED: Joi.boolean().default(false),
      ARENA_USER: Joi.string(),
      ARENA_PASSWORD: Joi.string().when('ARENA_USER', { then: Joi.string().required() }),
      MX_RECORDS: JoiCoerce.array()
        .min(1)
        .items(
          JoiCoerce.object<DnsCheckMxRecord>({
            exchange: Joi.string().required(),
            priority: Joi.number().required(),
          }),
        )
        .required(),
      SPF_CORRECT_VALUE: Joi.string().required(),
      SPF_REGEX: Joi.string(),
    })

    const { error, value: validatedEnvConfig } = envVarsSchema.validate(envConfig)
    if (error) {
      throw new Error(`Config validation error: ${error.message}`)
    }

    if (validatedEnvConfig.BASE_URL.startsWith('/')) {
      validatedEnvConfig.BASE_URL = validatedEnvConfig.BASE_URL.slice(1)
    }
    if (validatedEnvConfig.BASE_URL.endsWith('/')) {
      validatedEnvConfig.BASE_URL = validatedEnvConfig.BASE_URL.slice(0, -1)
    }

    return validatedEnvConfig
  }

  get<T>(key: string): T {
    return this.envConfig[key]
  }
}
