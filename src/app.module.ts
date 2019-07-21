import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { AppController } from "./app.controller"
import { AccountsController } from "./accounts/accounts.controller"
import { AccountsService } from "./accounts/accounts.service"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { AuthController } from "./auth/auth.controller"

@Module({
  imports: [AuthModule, UsersModule, MongooseModule.forRoot("mongodb://mailserver.local/ducky-api")],
  controllers: [AppController, AccountsController, AuthController],
  providers: [AccountsService]
})
export class AppModule {}
