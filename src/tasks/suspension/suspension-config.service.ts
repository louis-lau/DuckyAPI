import { BullModuleOptions, BullOptionsFactory } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { ConfigService } from 'src/config/config.service'

@Injectable()
export class SuspensionConfigService implements BullOptionsFactory {
  private redisUrl: string

  constructor(config: ConfigService) {
    this.redisUrl = config.REDIS_URL
  }

  createBullOptions(): BullModuleOptions {
    return {
      name: 'suspension',
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          delay: 6000,
          type: 'exponential',
        },
        removeOnComplete: 1000,
      },
      redis: this.redisUrl,
    }
  }
}
