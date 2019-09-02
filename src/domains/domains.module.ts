import { Module } from "@nestjs/common"
import { AccountsModule } from "src/accounts/accounts.module"
import { DkimModule } from "src/dkim/dkim.module"
import { ForwardersModule } from "src/forwarders/forwarders.module"
import { UsersModule } from "src/users/users.module"

import { DomainsController } from "./domains.controller"
import { DomainsService } from "./domains.service"

@Module({
  imports: [UsersModule, AccountsModule, DkimModule, ForwardersModule],
  controllers: [DomainsController],
  providers: [DomainsService]
})
export class DomainsModule {}
