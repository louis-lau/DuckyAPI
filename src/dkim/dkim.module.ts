import { HttpModule, Module } from '@nestjs/common'

import { DkimController } from './dkim.controller'
import { DkimService } from './dkim.service'

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
    }),
  ],
  exports: [DkimService],
  controllers: [DkimController],
  providers: [DkimService],
})
export class DkimModule {}
