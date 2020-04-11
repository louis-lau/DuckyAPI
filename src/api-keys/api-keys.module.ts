import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from 'src/config/config.module'
import { ConfigService } from 'src/config/config.service'
import { UsersModule } from 'src/users/users.module'

import { ApiKey } from './api-key.entity'
import { ApiKeysCli } from './api-keys.cli'
import { ApiKeysController } from './api-keys.controller'
import { ApiKeysService } from './api-keys.service'

@Module({
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ApiKeysCli],
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([ApiKey]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('TOKEN_SECRET'),
      }),
    }),
  ],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
