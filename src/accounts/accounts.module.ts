import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { DomainsModule } from 'src/domains/domains.module'

import { AccountsController } from './accounts.controller'
import { AccountsService } from './accounts.service'

@Module({
  imports: [
    forwardRef(() => DomainsModule),
    HttpModule.register({
      timeout: 10000,
    }),
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
