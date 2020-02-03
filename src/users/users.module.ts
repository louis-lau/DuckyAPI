import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PackagesModule } from 'src/packages/packages.module'

import { User } from './user.entity'
import { UsersCli } from './users.cli'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => PackagesModule)],
  providers: [UsersService, UsersCli],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
