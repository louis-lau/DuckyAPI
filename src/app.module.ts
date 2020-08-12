import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TypeOrmModule } from '@nestjs/typeorm'
import Arena from 'bull-arena'
import BasicAuth from 'express-basic-auth'
import { ConsoleModule } from 'nestjs-console'
import { resolve } from 'path'

import { AccountsModule } from './accounts/accounts.module'
import { ApiKeysModule } from './api-keys/api-keys.module'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from './config/config.module'
import { ConfigService } from './config/config.service'
import { DkimModule } from './dkim/dkim.module'
import { DomainsModule } from './domains/domains.module'
import { FiltersModule } from './filters/filters.module'
import { ForwardersModule } from './forwarders/forwarders.module'
import { PackagesModule } from './packages/packages.module'
import { TasksModule } from './tasks/delete-for-domain/delete-for-domain.module'
import { SuspensionModule } from './tasks/suspension/suspension.module'
import { UsersModule } from './users/users.module'
import Bull from 'bull'

const entityContext = require.context('.', true, /\.entity\.ts$/)
const migrationContext = require.context('.', true, /migrations\/\d*-.*\.ts$/)

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mongodb',
        url: config.MONGODB_URL,
        keepConnectionAlive: true,
        entities: [
          ...entityContext.keys().map((id) => {
            const entityModule = entityContext(id)
            const [entity] = Object.values<any>(entityModule)
            return entity
          }),
        ],
        migrations: [
          ...migrationContext.keys().map((id) => {
            const migrationModule = migrationContext(id)
            const [migration] = Object.values<any>(migrationModule)
            return migration
          }),
        ],
        migrationsTransactionMode: 'each',
        migrationsRun: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        appname: 'ducky-api',
      }),
    }),
    ServeStaticModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        if (config.SERVE_DUCKYPANEL) {
          return [
            {
              rootPath: resolve('node_modules/duckypanel/DuckyPanel'),
              exclude: [`/${config.BASE_URL}/*`],
            },
          ]
        }
        return []
      },
      imports: [ConfigModule],
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
    ConsoleModule,
    ApiKeysModule,
    SuspensionModule,
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly config: ConfigService) {}
  public configure(consumer: MiddlewareConsumer): void {
    if (this.config.QUEUE_UI) {
      if (this.config.QUEUE_UI_USER) {
        consumer
          .apply(
            BasicAuth({
              challenge: true,
              users: {
                [this.config.QUEUE_UI_USER]: this.config.QUEUE_UI_PASSWORD,
              },
            }),
          )
          .forRoutes(`queues`)
      }

      consumer
        .apply(
          Arena(
            {
              Bull,
              queues: [
                {
                  name: 'deleteForDomain',
                  hostId: 'DuckyAPI',
                  redis: this.config.REDIS_URL,
                },
                {
                  name: 'suspension',
                  hostId: 'DuckyAPI',
                  redis: this.config.REDIS_URL,
                },
              ],
            },
            {
              useCdn: false,
              disableListen: true,
            },
          ),
        )
        .forRoutes(`queues`)
    }
  }
}
