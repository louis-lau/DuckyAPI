import { BullModule } from '@nestjs/bull'
import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { AccountsModule } from 'src/accounts/accounts.module'
import { ConfigModule } from 'src/config/config.module'
import { ConfigService } from 'src/config/config.service'
import { DkimModule } from 'src/dkim/dkim.module'
import { ForwardersModule } from 'src/forwarders/forwarders.module'
import { UsersModule } from 'src/users/users.module'

import { DomainsController } from './domains.controller'
import { DomainsService } from './domains.service'

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
    }),
    UsersModule,
    forwardRef(() => AccountsModule),
    forwardRef(() => DkimModule),
    ForwardersModule,
    BullModule.registerQueueAsync({
      name: 'deleteForDomain',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        name: 'deleteForDomain',
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            delay: 6000,
            type: 'exponential',
          },
          removeOnComplete: 1000,
        },
        redis: config.get('REDIS_URL'),
      }),
    }),
  ],
  controllers: [DomainsController],
  providers: [DomainsService],
  exports: [DomainsService],
})
export class DomainsModule {}
