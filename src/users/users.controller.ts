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

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserAdminDto } from './dto/update-user-admin.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserIdParams } from './dto/user-id-params.dto'
import { User } from './user.entity'
import { UsersService } from './users.service'

@Controller('users')
@ApiTags('Users')
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
@ApiBadRequestResponse({ description: 'Error that is resolvable user side' })
@ApiInternalServerErrorResponse({ description: 'Server error that is not resolvable user side' })
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '[Admin only] Create new API user' })
  @ApiCreatedResponse({ description: 'User successfully created' })
  public async createUser(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.usersService.createUser(createUserDto)
  }

  @Put(':id')
  @ApiOperation({ summary: '[Admin only] Update API user' })
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
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get account info for current access token' })
  @ApiOkResponse({ description: 'User info', type: User })
  public async getMe(@ReqUser() user: User): Promise<User> {
    delete user.password
    delete user.package
    return user
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Put('me')
  @ApiOperation({ summary: 'Update username/password' })
  @ApiOkResponse({ description: 'User updated successfully' })
  public async updateMe(@ReqUser() user: User, @Body() updateUserDto: UpdateUserDto): Promise<void> {
    await this.usersService.updateUsernameOrPassword(user._id, updateUserDto)
  }
}
