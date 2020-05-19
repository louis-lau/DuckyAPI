import { BullModule } from '@nestjs/bull'
import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DomainsModule } from 'src/domains/domains.module'
import { PackagesModule } from 'src/packages/packages.module'
import { DeleteForDomainConfigService } from 'src/tasks/delete-for-domain/delete-for-domain-config.service'
import { SuspensionConfigService } from 'src/tasks/suspension/suspension-config.service'

import { User } from './user.entity'
import { UsersCli } from './users.cli'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueueAsync(
      {
        name: 'suspension',
        useClass: SuspensionConfigService,
      },
      {
        name: 'deleteForDomain',
        useClass: DeleteForDomainConfigService,
      },
    ),
    forwardRef(() => PackagesModule),
    forwardRef(() => DomainsModule),
  ],
  providers: [UsersService, UsersCli],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
