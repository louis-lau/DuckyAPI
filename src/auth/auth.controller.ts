import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common'
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
import { ForbidApiKeyGuard } from 'src/common/guards/forbid-api-key.guard'
import { User } from 'src/users/user.entity'

import { ApiKey } from './api-key.entity'
import { ApiKeyService } from './api-key.service'
import { AuthService } from './auth.service'
import { AccessToken } from './class/access-token.class'
import { ApiKeyAcessToken } from './class/api-key-access-token'
import { LoginDto } from './dto/login.dto'
import { ApiKeyIdParams } from './params/api-key-id.params'

@Controller('authentication')
@ApiTags('Authentication')
@ApiBadRequestResponse({ description: 'Error that is resolvable user side' })
@ApiInternalServerErrorResponse({ description: 'Server error that is not resolvable user side' })
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
export class AuthController {
  public constructor(private readonly authService: AuthService, private readonly apiKeyService: ApiKeyService) {}

  @Delete()
  @ApiOperation({
    summary: 'Revoke previous access tokens',
    description: 'Note: This resource is forbidden when using an API key as authorization. Use an access token.',
  })
  @UseGuards(AuthGuard('jwt'), ForbidApiKeyGuard)
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

  @Post('apikeys')
  @ApiOperation({
    summary: 'Create an API key',
    description: 'Note: This resource is forbidden when using an API key as authorization. Use an access token.',
  })
  @UseGuards(AuthGuard('jwt'), ForbidApiKeyGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'API key', type: ApiKeyAcessToken })
  public async createApiKey(@ReqUser() user: User, @Body() apiKey: ApiKey): Promise<ApiKeyAcessToken> {
    return this.authService.createApiKey(user, apiKey.name)
  }

  @Get('apikeys')
  @ApiOperation({ summary: 'List active api keys' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List of active api keys', type: ApiKey, isArray: true })
  public async getApiKeys(@ReqUser() user: User): Promise<ApiKey[]> {
    return this.apiKeyService.getKeysForUser(user._id)
  }

  @Delete('apikeys/:id')
  @ApiOperation({
    summary: 'Revoke api key',
    description: 'Note: This resource is forbidden when using an API key as authorization. Use an access token.',
  })
  @UseGuards(AuthGuard('jwt'), ForbidApiKeyGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Api key revoked' })
  public async revokeApiKey(@ReqUser() user: User, @Param() apiKeyIdParams: ApiKeyIdParams): Promise<void> {
    return this.apiKeyService.revokeKey(user._id, apiKeyIdParams.id)
  }
}
