import { HttpModule, Module } from "@nestjs/common"
import { AccountsModule } from "src/accounts/accounts.module"

import { FiltersController } from "./filters.controller"
import { FiltersService } from "./filters.service"

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000
    }),
    AccountsModule
  ],
  controllers: [FiltersController],
  providers: [FiltersService]
})
export class FiltersModule {}
