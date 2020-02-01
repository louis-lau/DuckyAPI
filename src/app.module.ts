import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import Arena from 'bull-arena'
import BasicAuth from 'express-basic-auth'

import { AccountsModule } from './accounts/accounts.module'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from './config/config.module'
import { ConfigService } from './config/config.service'
import { DkimModule } from './dkim/dkim.module'
import { DomainsModule } from './domains/domains.module'
import { FiltersModule } from './filters/filters.module'
import { ForwardersModule } from './forwarders/forwarders.module'
import { PackagesModule } from './packages/packages.module'
import { TasksModule } from './tasks/tasks.module'
import { UsersModule } from './users/users.module'

const entityContext = require.context('.', true, /\.entity\.ts$/)
const migrationContext = require.context('.', true, /migrations\/\d*-.*\.ts$/)

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mongodb',
        url: config.get<string>('MONGODB_URL'),
        keepConnectionAlive: true,
        entities: [
          ...entityContext.keys().map(id => {
            const entityModule = entityContext(id)
            const [entity] = Object.values(entityModule)
            return entity
          }),
        ],
        migrations: [
          ...migrationContext.keys().map(id => {
            const migrationModule = migrationContext(id)
            const [migration] = Object.values(migrationModule)
            return migration
          }),
        ],
        migrationsTransactionMode: 'each',
        migrationsRun: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        appname: 'ducky-api',
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
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
  constructor(private readonly config: ConfigService) {}
  public configure(consumer: MiddlewareConsumer): void {
    if (this.config.get<boolean>('ARENA_ENABLED')) {
      if (this.config.get<string>('ARENA_USER')) {
        consumer
          .apply(
            BasicAuth({
              challenge: true,
              users: {
                [this.config.get<string>('ARENA_USER')]: this.config.get<string>('ARENA_PASSWORD'),
              },
            }),
          )
          .forRoutes(`arena`)
      }

      consumer
        .apply(
          Arena(
            {
              queues: [
                {
                  name: 'tasks',
                  hostId: 'DuckyAPI',
                  redis: this.config.get<string>('REDIS_URL'),
                },
              ],
            },
            {
              disableListen: true,
            },
          ),
        )
        .forRoutes(`arena`)
    }
  }
}
