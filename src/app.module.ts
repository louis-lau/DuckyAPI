import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AccountsController } from "./accounts/accounts.controller"
import { AccountsService } from "./accounts/accounts.service"

@Module({
  imports: [],
  controllers: [AppController, AccountsController],
  providers: [AccountsService]
})
export class AppModule {}
