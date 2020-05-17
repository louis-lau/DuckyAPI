import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ReqUser } from 'src/common/decorators/req-user.decorator'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RolesGuard } from 'src/common/guards/roles.guard'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserAdminDto } from './dto/update-user-admin.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserIdParams } from './dto/user-id-params.dto'
import { User } from './user.entity'
import { UsersService } from './users.service'

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
@ApiBadRequestResponse({ description: 'Error that is resolvable user side' })
@ApiInternalServerErrorResponse({ description: 'Server error that is not resolvable user side' })
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @ApiTags('Users')
  @ApiOperation({ operationId: 'getUsers', summary: '[Admin only] List all users' })
  @ApiCreatedResponse({ description: 'list of users', type: User, isArray: true })
  public async getUsers(): Promise<User[]> {
    return this.usersService.getUsers()
  }

  @Post()
  @Roles('admin')
  @ApiTags('Users')
  @ApiOperation({ operationId: 'createUser', summary: '[Admin only] Create new API user' })
  @ApiCreatedResponse({ description: 'User successfully created' })
  public async createUser(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.usersService.createUser(createUserDto)
  }

  @Get('me')
  @Roles('user')
  @ApiTags('Profile')
  @ApiOperation({ operationId: 'getMe', summary: 'Get account info for current access token' })
  @ApiOkResponse({ description: 'User info', type: User })
  public async getMe(@ReqUser() user: User): Promise<User> {
    delete user.password
    delete user.package
    delete user.minTokenDate
    return user
  }

  @Put('me')
  @Roles('user')
  @ApiTags('Profile')
  @ApiOperation({ operationId: 'updateMe', summary: 'Update username/password' })
  @ApiOkResponse({ description: 'User updated successfully' })
  public async updateMe(@ReqUser() user: User, @Body() updateUserDto: UpdateUserDto): Promise<void> {
    await this.usersService.updateUsernameOrPassword(user._id, updateUserDto)
  }

  @Put(':id')
  @Roles('admin')
  @ApiTags('Users')
  @ApiOperation({ operationId: 'updateUser', summary: '[Admin only] Update API user' })
  @ApiOkResponse()
  public async updateUser(
    @Body() updateUserAdminDto: UpdateUserAdminDto,
    @Param() userIdParams: UserIdParams,
  ): Promise<void> {
    if (updateUserAdminDto.username || updateUserAdminDto.password) {
      this.usersService.updateUsernameOrPassword(userIdParams.id, updateUserAdminDto)
    }
    if (updateUserAdminDto.packageId) {
      this.usersService.updatePackage(userIdParams.id, updateUserAdminDto.packageId)
    }
    if (updateUserAdminDto.suspended !== undefined) {
      this.usersService.suspend(userIdParams.id, updateUserAdminDto.suspended)
    }
  }
}
