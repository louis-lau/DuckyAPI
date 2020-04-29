import { Module } from '@nestjs/common'
import { AccountsModule } from 'src/accounts/accounts.module'
import { ForwardersModule } from 'src/forwarders/forwarders.module'

import { SuspensionProcessor } from './suspension.processor'

@Module({
  imports: [AccountsModule, ForwardersModule],
  providers: [SuspensionProcessor],
})
export class SuspensionModule {}
