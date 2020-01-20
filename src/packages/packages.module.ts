import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from 'src/users/users.module'

import { Package } from './package.entity'
import { PackagesController } from './packages.controller'
import { PackagesService } from './packages.service'

@Module({
  imports: [TypeOrmModule.forFeature([Package]), forwardRef(() => UsersModule)],
  exports: [PackagesService],
  controllers: [PackagesController],
  providers: [PackagesService],
})
export class PackagesModule {}
