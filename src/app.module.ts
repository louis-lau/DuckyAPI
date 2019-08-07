import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { AppController } from "./app.controller"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { AccountsModule } from "./accounts/accounts.module"
import { DomainsModule } from './domains/domains.module';

@Module({
  imports: [
    MongooseModule.forRoot("mongodb://mailserver.local/ducky-api", { useCreateIndex: true, useNewUrlParser: true }),
    AuthModule,
    AccountsModule,
    UsersModule,
    DomainsModule
  ],
  controllers: [AppController]
})
export class AppModule {}
