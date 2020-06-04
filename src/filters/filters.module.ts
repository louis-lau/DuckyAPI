import { HttpModule, Module } from '@nestjs/common'
import { AccountsModule } from 'src/accounts/accounts.module'
import { ConfigModule } from 'src/config/config.module'
import { ConfigService } from 'src/config/config.service'

import { FiltersController } from './filters.controller'
import { FiltersService } from './filters.service'

@Module({
  imports: [
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
    AccountsModule,
  ],
  controllers: [FiltersController],
  providers: [FiltersService],
})
export class FiltersModule {}
