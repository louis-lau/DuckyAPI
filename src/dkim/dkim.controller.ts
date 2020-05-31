import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ReqUser } from 'src/common/decorators/req-user.decorator'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { User } from 'src/users/user.entity'

import { DkimKey } from './class/dkim-key.class'
import { DkimService } from './dkim.service'
import { AddDkimDto } from './dto/add-dkim.dto'
import { DkimParams } from './params/dkim.params'

@Controller('domains/:domainOrAlias/dkim')
@ApiTags('Dkim')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('user')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
@ApiBadRequestResponse({ description: 'Bad user input' })
@ApiNotFoundResponse({ description: 'Domain not found in account' })
export class DkimController {
  public constructor(private readonly dkimService: DkimService) {}

  @Delete()
  @ApiOperation({ operationId: 'deleteDkim', summary: 'Delete DKIM key for a domain' })
  @ApiOkResponse({ description: 'DKIM key successfully deleted' })
  public async deleteDkim(@ReqUser() user: User, @Param() dkimParams: DkimParams): Promise<void> {
    return this.dkimService.deleteDkim(user, dkimParams.domainOrAlias)
  }

  @Get()
  @ApiOperation({ operationId: 'getDkim', summary: 'Get DKIM key info for a domain' })
  @ApiOkResponse({ description: 'DKIM key info', type: DkimKey })
  public async getDkim(@ReqUser() user: User, @Param() dkimParams: DkimParams): Promise<DkimKey> {
    return this.dkimService.getDKIM(user, dkimParams.domainOrAlias)
  }

  @Put()
  @ApiOperation({ operationId: 'updateDkim', summary: 'Add or update DKIM key for a domain' })
  @ApiOkResponse({ description: 'DKIM key info', type: DkimKey })
  public async updateDkim(
    @ReqUser() user: User,
    @Body() addDkimDto: AddDkimDto,
    @Param() dkimParams: DkimParams,
  ): Promise<DkimKey> {
    return this.dkimService.updateDkim(user, addDkimDto, dkimParams.domainOrAlias)
  }
}
