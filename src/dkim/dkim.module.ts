import { forwardRef, Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from 'src/config/config.module'
import { ConfigService } from 'src/config/config.service'
import { DomainsModule } from 'src/domains/domains.module'

import { DkimController } from './dkim.controller'
import { DkimService } from './dkim.service'

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
  exports: [DkimService],
  controllers: [DkimController],
  providers: [DkimService],
})
export class DkimModule {}
