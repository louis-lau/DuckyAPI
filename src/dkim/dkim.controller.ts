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
import { DomainParams } from 'src/domains/params/domain.params'
import { User } from 'src/users/class/user.class'

import { DkimKey } from './class/dkim-key.class'
import { DkimService } from './dkim.service'
import { AddDkimDto } from './dto/add-dkim.dto'

@Controller('domains/:domain/dkim')
@ApiTags('DKIM')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
@ApiBadRequestResponse({ description: 'Error that is resolvable user side' })
@ApiInternalServerErrorResponse({ description: 'Server error that is not resolvable user side' })
@ApiNotFoundResponse({ description: 'Domain not found in account' })
export class DkimController {
  public constructor(private readonly dkimService: DkimService) {}

  @Delete()
  @ApiOperation({ summary: 'Delete DKIM key for a domain' })
  @ApiOkResponse({ description: 'DKIM key successfully deleted' })
  public async deleteDkim(@ReqUser() user: User, @Param() domainParams: DomainParams): Promise<void> {
    return this.dkimService.deleteDkim(user, domainParams.domain)
  }

  @Get()
  @ApiOperation({ summary: 'Get DKIM key info for a domain' })
  @ApiOkResponse({ description: 'DKIM key info', type: DkimKey })
  public async getDkim(@ReqUser() user: User, @Param() domainParams: DomainParams): Promise<DkimKey> {
    return this.dkimService.getDKIM(user, domainParams.domain)
  }

  @Put()
  @ApiOperation({ summary: 'Add or update DKIM key for a domain' })
  @ApiOkResponse({ description: 'DKIM key info', type: DkimKey })
  public async updateDkim(
    @ReqUser() user: User,
    @Body() addDkimDto: AddDkimDto,
    @Param() domainParams: DomainParams,
  ): Promise<DkimKey> {
    return this.dkimService.updateDkim(user, addDkimDto, domainParams.domain)
  }
}
