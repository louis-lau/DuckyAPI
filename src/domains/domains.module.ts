import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { AccountsModule } from 'src/accounts/accounts.module'
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
  ],
  controllers: [DomainsController],
  providers: [DomainsService],
  exports: [DomainsService],
})
export class DomainsModule {}
