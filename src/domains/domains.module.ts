import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
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
    UsersModule,
    AccountsModule,
    DkimModule,
    ForwardersModule,
    BullModule.registerQueueAsync({
      name: 'tasks',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.get('REDIS_URL'),
      }),
    }),
  ],
  controllers: [DomainsController],
  providers: [DomainsService],
})
export class DomainsModule {}
