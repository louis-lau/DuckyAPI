import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiUseTags,
} from '@nestjs/swagger'
import { ReqUser } from 'src/common/decorators/req-user.decorator'

import { UserNoPassword } from './class/user-no-password.class'
import { User } from './class/user.class'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersService } from './users.service'

@Controller('users')
@ApiUseTags('Users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
@ApiBadRequestResponse({ description: 'Error that is resolvable user side' })
@ApiInternalServerErrorResponse({ description: 'Server error that is not resolvable user side' })
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ title: '[Admin only] Create new API user' })
  @ApiCreatedResponse({ description: 'User successfully created' })
  public async createUser(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.usersService.createUser(createUserDto)
  }

  @Get('me')
  @ApiOperation({ title: 'Get account info for current access token' })
  @ApiOkResponse({ description: 'User info', type: UserNoPassword })
  public async getMe(@ReqUser() user: User): Promise<UserNoPassword> {
    return this.usersService.userNoPasswordStrip(user)
  }

  @Put('me')
  @ApiOperation({ title: 'Update username/password' })
  @ApiOkResponse({ description: 'User updated successfully' })
  public async updateMe(@ReqUser() user: User, @Body() updateUserDto: UpdateUserDto): Promise<void> {
    this.usersService.updateUser(user._id, updateUserDto)
  }
}
