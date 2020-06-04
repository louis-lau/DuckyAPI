import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ApiKeyAccessToken } from 'src/api-keys/class/api-key-access-token'
import { ApiKeyIdParams } from 'src/api-keys/params/api-key-id.params'
import { ReqUser } from 'src/common/decorators/req-user.decorator'
import { Roles } from 'src/common/decorators/roles.decorator'
import { ForbidApiKeyGuard } from 'src/common/guards/forbid-api-key.guard'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { User } from 'src/users/user.entity'

import { ApiKey } from './api-key.entity'
import { ApiKeysService } from './api-keys.service'

@Controller('apikeys')
@ApiTags('Api Keys')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@ApiBadRequestResponse({ description: 'Bad user input' })
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({
    operationId: 'createApiKey',
    summary: 'Create an API key',
    description: 'Note: This resource is forbidden when using an API key as authorization. Use an access token.',
  })
  @UseGuards(ForbidApiKeyGuard, RolesGuard)
  @Roles('user')
  @ApiCreatedResponse({ description: 'API key', type: ApiKeyAccessToken })
  public async createApiKey(@ReqUser() user: User, @Body() apiKey: ApiKey): Promise<ApiKeyAccessToken> {
    return this.apiKeysService.generateApiKey(user, apiKey.name)
  }

  @Get()
  @ApiOperation({ operationId: 'getApiKeys', summary: 'List active api keys' })
  @ApiOkResponse({ description: 'List of active api keys', type: ApiKey, isArray: true })
  public async getApiKeys(@ReqUser() user: User): Promise<ApiKey[]> {
    return this.apiKeysService.getKeysForUser(user._id)
  }

  @Delete(':id')
  @ApiOperation({
    operationId: 'revokeApiKey',
    summary: 'Revoke api key',
    description: 'Note: This resource is forbidden when using an API key as authorization. Use an access token.',
  })
  @UseGuards(ForbidApiKeyGuard, RolesGuard)
  @Roles('user')
  @ApiOkResponse({ description: 'Api key revoked' })
  public async revokeApiKey(@ReqUser() user: User, @Param() apiKeyIdParams: ApiKeyIdParams): Promise<void> {
    return this.apiKeysService.revokeKey(user._id, apiKeyIdParams.id)
  }
}
