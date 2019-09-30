import { Module } from "@nestjs/common"
import { AccountsModule } from "src/accounts/accounts.module"
import { ForwardersModule } from "src/forwarders/forwarders.module"

import { TasksProcessor } from "./tasks.processor"

@Module({
  imports: [AccountsModule, ForwardersModule],
  providers: [TasksProcessor]
})
export class TasksModule {}
