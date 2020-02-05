import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common'
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
import { ForbidApiKeyGuard } from 'src/common/guards/forbid-api-key.guard'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { User } from 'src/users/user.entity'

import { ApiKeysService } from '../api-keys/api-keys.service'
import { AuthService } from './auth.service'
import { AccessToken } from './class/access-token.class'
import { LoginDto } from './dto/login.dto'

@Controller('authentication')
@ApiTags('Authentication')
@ApiBadRequestResponse({ description: 'Error that is resolvable user side' })
@ApiInternalServerErrorResponse({ description: 'Server error that is not resolvable user side' })
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
export class AuthController {
  public constructor(private readonly authService: AuthService, private readonly apiKeysService: ApiKeysService) {}

  @Delete()
  @ApiOperation({
    summary: 'Revoke previous access tokens',
    description: 'Note: This resource is forbidden when using an API key as authorization. Use an access token.',
  })
  @UseGuards(AuthGuard('jwt'), ForbidApiKeyGuard, RolesGuard)
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successfully expired previous tokens' })
  public async revokeAllAccessTokens(@ReqUser() user: User): Promise<void> {
    return this.authService.expireTokens(user)
  }

  @Post()
  @ApiOperation({ summary: 'Get an access token' })
  @UseGuards(AuthGuard('local'))
  @ApiCreatedResponse({ description: 'Login successful', type: AccessToken })
  @ApiUnauthorizedResponse({ description: 'Invalid username or password' })
  public async getAccessToken(@ReqUser() user: User, @Body() loginDto: LoginDto): Promise<AccessToken> {
    return this.authService.getAccessToken(user, loginDto.rememberMe)
  }
}
