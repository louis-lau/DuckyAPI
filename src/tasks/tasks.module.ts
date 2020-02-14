import { Module } from '@nestjs/common'
import { AccountsModule } from 'src/accounts/accounts.module'
import { DomainsModule } from 'src/domains/domains.module'
import { ForwardersModule } from 'src/forwarders/forwarders.module'

import { TasksProcessor } from './tasks.processor'

@Module({
  imports: [AccountsModule, ForwardersModule, DomainsModule],
  providers: [TasksProcessor],
})
export class TasksModule {}
