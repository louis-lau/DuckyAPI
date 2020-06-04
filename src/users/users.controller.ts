import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ReqUser } from 'src/common/decorators/req-user.decorator'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RolesGuard } from 'src/common/guards/roles.guard'

import { CreateUserDto } from './dto/create-user.dto'
import { DeleteUserDto } from './dto/delete-user.dto'
import { UpdateUserAdminDto } from './dto/update-user-admin.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserIdParams } from './dto/user-id-params.dto'
import { User } from './user.entity'
import { UsersService } from './users.service'

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
@ApiBadRequestResponse({ description: 'Bad user input' })
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @ApiTags('Users')
  @ApiOperation({ operationId: 'getUsers', summary: '[Admin only] List all users' })
  @ApiOkResponse({ description: 'list of users', type: User, isArray: true })
  public async getUsers(): Promise<User[]> {
    return (await this.usersService.getUsers()).map((user) => {
      delete user.password
      delete user.minTokenDate
      delete user.domains
      return user
    })
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
  @Roles('user', 'admin')
  @ApiTags('Profile')
  @ApiOperation({ operationId: 'getMe', summary: 'Get account info for current access token' })
  @ApiOkResponse({ description: 'User info', type: User })
  public async getMe(@ReqUser() user: User): Promise<User> {
    delete user.password
    delete user.minTokenDate
    delete user.domains
    return user
  }

  @Put('me')
  @Roles('user', 'admin')
  @ApiTags('Profile')
  @ApiOperation({ operationId: 'updateMe', summary: 'Update username/password' })
  @ApiOkResponse({ description: 'User updated successfully' })
  public async updateMe(@ReqUser() user: User, @Body() updateUserDto: UpdateUserDto): Promise<void> {
    await this.usersService.updateUsernameOrPassword(user._id, updateUserDto)
  }

  @Delete(':id')
  @Roles('admin')
  @ApiTags('Users')
  @ApiOperation({ operationId: 'deleteUser', summary: '[Admin only] Delete API user' })
  @ApiBody({ required: false, type: DeleteUserDto })
  @ApiOkResponse({ description: 'User successfully deleted' })
  public async deleteUser(@Param() userIdParams: UserIdParams, @Body() deleteUserDto?: DeleteUserDto): Promise<void> {
    this.usersService.deleteUser(userIdParams.id, deleteUserDto?.onlyDeleteDomainsAndSuspend)
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
