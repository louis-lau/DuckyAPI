import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import * as Arena from "bull-arena"
import * as basicAuth from "express-basic-auth"

import { AccountsModule } from "./accounts/accounts.module"
import { AppController } from "./app.controller"
import { AuthModule } from "./auth/auth.module"
import { arena } from "./constants"
import { redisOptions } from "./constants"
import { DkimModule } from "./dkim/dkim.module"
import { DomainsModule } from "./domains/domains.module"
import { FiltersModule } from "./filters/filters.module"
import { ForwardersModule } from "./forwarders/forwarders.module"
import { TasksModule } from "./tasks/tasks.module"
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
    DkimModule,
    ForwardersModule,
    TasksModule
  ],
  controllers: [AppController]
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    if (arena.enabled) {
      if (arena.basicAuth.enabled) {
        consumer
          .apply(
            basicAuth({
              challenge: true,
              users: arena.basicAuth.users
            })
          )
          .forRoutes("arena")
      }

      consumer
        .apply(
          Arena(
            {
              queues: [
                {
                  name: "tasks",
                  hostId: "DuckyAPI",
                  redis: redisOptions
                }
              ]
            },
            {
              // basePath: "/tasks",
              disableListen: true
            }
          )
        )
        .forRoutes("arena")
    }
  }
}
