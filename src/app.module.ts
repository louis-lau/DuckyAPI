import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import Arena from 'bull-arena'
import BasicAuth from 'express-basic-auth'

import { AccountsModule } from './accounts/accounts.module'
import { AuthModule } from './auth/auth.module'
import { arena } from './constants'
import { redisOptions } from './constants'
import { DkimModule } from './dkim/dkim.module'
import { DomainsModule } from './domains/domains.module'
import { FiltersModule } from './filters/filters.module'
import { ForwardersModule } from './forwarders/forwarders.module'
import { Package } from './packages/package.entity'
import { PackagesModule } from './packages/packages.module'
import { TasksModule } from './tasks/tasks.module'
import { User } from './users/user.entity'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: 'mongodb://mailserver.local:27017/ducky-api',
      keepConnectionAlive: true,
      entities: [User, Package],
      synchronize: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      appname: 'ducky-api',
    }),
    AuthModule,
    AccountsModule,
    UsersModule,
    DomainsModule,
    FiltersModule,
    DkimModule,
    ForwardersModule,
    TasksModule,
    PackagesModule,
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    if (arena.enabled) {
      if (arena.basicAuth.enabled) {
        consumer
          .apply(
            BasicAuth({
              challenge: true,
              users: arena.basicAuth.users,
            }),
          )
          .forRoutes('arena')
      }

      consumer
        .apply(
          Arena(
            {
              queues: [
                {
                  name: 'tasks',
                  hostId: 'DuckyAPI',
                  redis: redisOptions,
                },
              ],
            },
            {
              // basePath: "/tasks",
              disableListen: true,
            },
          ),
        )
        .forRoutes('arena')
    }
  }
}
