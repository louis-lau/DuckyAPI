import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { ConfigModule } from 'src/config/config.module'
import { ConfigService } from 'src/config/config.service'
import { DomainsModule } from 'src/domains/domains.module'

import { AccountsController } from './accounts.controller'
import { AccountsService } from './accounts.service'

@Module({
  imports: [
    forwardRef(() => DomainsModule),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        timeout: 10000,
        maxRedirects: 5,
        baseURL: config.WILDDUCK_API_URL,
        headers: {
          'X-Access-Token': config.WILDDUCK_API_TOKEN,
        },
      }),
    }),
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
