import { Module } from "@nestjs/common"
import { AccountsModule } from "src/accounts/accounts.module"
import { UsersModule } from "src/users/users.module"

import { DomainsController } from "./domains.controller"
import { DomainsService } from "./domains.service"

@Module({
  imports: [UsersModule, AccountsModule],
  controllers: [DomainsController],
  providers: [DomainsService]
})
export class DomainsModule {}
