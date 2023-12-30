import { forwardRef, Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from 'src/config/config.module'
import { ConfigService } from 'src/config/config.service'
import { DomainsModule } from 'src/domains/domains.module'

import { ForwardersController } from './forwarders.controller'
import { ForwardersService } from './forwarders.service'

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
  exports: [ForwardersService],
  providers: [ForwardersService],
  controllers: [ForwardersController],
})
export class ForwardersModule {}
