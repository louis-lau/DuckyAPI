import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { DomainsModule } from 'src/domains/domains.module'

import { ForwardersController } from './forwarders.controller'
import { ForwardersService } from './forwarders.service'

@Module({
  imports: [
    forwardRef(() => DomainsModule),
    HttpModule.register({
      timeout: 10000,
    }),
  ],
  exports: [ForwardersService],
  providers: [ForwardersService],
  controllers: [ForwardersController],
})
export class ForwardersModule {}
