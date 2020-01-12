import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common'
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
import { User } from 'src/users/class/user.class'

import { AuthService } from './auth.service'
import { AccessToken } from './class/access-token.class'
import { LoginDto } from './login.dto'

@Controller('authentication')
@ApiUseTags('Authentication')
@ApiBadRequestResponse({ description: 'Error that is resolvable user side' })
@ApiInternalServerErrorResponse({ description: 'Server error that is not resolvable user side' })
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Delete()
  @ApiOperation({ title: 'Revoke previous access tokens' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successfully expired previous tokens' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  public async logoutAll(@ReqUser() user: User): Promise<void> {
    return this.authService.expireTokens(user)
  }

  @Post()
  @ApiOperation({ title: 'Create an access token' })
  @UseGuards(AuthGuard('local'))
  @ApiCreatedResponse({ description: 'Login successful', type: AccessToken })
  @ApiUnauthorizedResponse({ description: 'Invalid username or password' })
  public async login(@ReqUser() user: User, @Body() loginDto: LoginDto): Promise<AccessToken> {
    return this.authService.getAccessToken(user, loginDto.rememberMe)
  }
}
