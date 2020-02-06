import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { DomainsModule } from 'src/domains/domains.module'

import { DkimController } from './dkim.controller'
import { DkimService } from './dkim.service'

@Module({
  imports: [
    forwardRef(() => DomainsModule),
    HttpModule.register({
      timeout: 10000,
    }),
  ],
  exports: [DkimService],
  controllers: [DkimController],
  providers: [DkimService],
})
export class DkimModule {}
