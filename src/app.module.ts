import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"

import { AccountsModule } from "./accounts/accounts.module"
import { AppController } from "./app.controller"
import { AuthModule } from "./auth/auth.module"
import { DkimModule } from "./dkim/dkim.module"
import { DomainsModule } from "./domains/domains.module"
import { FiltersModule } from "./filters/filters.module"
import { UsersModule } from "./users/users.module"

@Module({
  imports: [
    MongooseModule.forRoot("mongodb://mailserver.local/ducky-api", {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false
    }),
    AuthModule,
    AccountsModule,
    UsersModule,
    DomainsModule,
    FiltersModule,
    DkimModule
  ],
  controllers: [AppController]
})
export class AppModule {}
