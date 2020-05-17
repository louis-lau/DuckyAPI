import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { IsNotSuspended } from 'src/common/decorators/is-not-suspended.decorator'
import { ReqUser } from 'src/common/decorators/req-user.decorator'
import { Roles } from 'src/common/decorators/roles.decorator'
import { IsNotSuspendedGuard } from 'src/common/guards/is-not-suspended.guard'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { User } from 'src/users/user.entity'

import { DnsCheck } from './class/dns.class'
import { Domain, DomainAlias } from './domain.entity'
import { DomainsService } from './domains.service'
import { AliasParams } from './params/alias.params'
import { DomainParams } from './params/domain.params'

@Controller('domains')
@ApiTags('Domains')
@UseGuards(AuthGuard('jwt'), RolesGuard, IsNotSuspendedGuard)
@Roles('user')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
@ApiBadRequestResponse({ description: 'Error that is resolvable user side' })
@ApiInternalServerErrorResponse({ description: 'Server error that is not resolvable user side' })
export class DomainsController {
  public constructor(private readonly domainsService: DomainsService) {}
  @Delete(':domain')
  @ApiOperation({
    operationId: 'deleteDomain',
    summary: 'Delete a domain',
    description:
      'WARNING: This will also delete any email accounts, forwarders, and DKIM keys associated with this domain',
  })
  @ApiOkResponse({ description: 'Domain successfully deleted' })
  @ApiNotFoundResponse({ description: 'Domain not found on account' })
  private async deleteDomain(@ReqUser() user: User, @Param() domainParams: DomainParams): Promise<void> {
    return this.domainsService.deleteDomain(user, domainParams.domain)
  }

  @Get()
  @ApiOperation({ operationId: 'getDomains', summary: 'List domains' })
  @ApiOkResponse({ description: 'A list of domains', type: Domain, isArray: true })
  private async getDomains(@ReqUser() user: User): Promise<Domain[]> {
    return this.domainsService.getDomains(user)
  }

  @Post()
  @IsNotSuspended()
  @ApiOperation({ operationId: 'addDomain', summary: 'Add a domain' })
  @ApiCreatedResponse({ description: 'Domain successfully added' })
  private async addDomain(@ReqUser() user: User, @Body() domainDto: Domain): Promise<void> {
    return this.domainsService.addDomain(user, domainDto.domain)
  }

  @Get(':domain/DNS')
  @ApiOperation({ operationId: 'checkDNS', summary: 'Get and check DNS records' })
  @ApiOkResponse({ description: 'The current and the correct DNS records for this domain', type: DnsCheck })
  @ApiNotFoundResponse({ description: 'Domain not found on account' })
  private async checkDNS(@ReqUser() user: User, @Param() domainParams: DomainParams): Promise<DnsCheck> {
    return this.domainsService.checkDns(user, domainParams.domain)
  }

  @Post(':domain/aliases')
  @IsNotSuspended()
  @ApiOperation({ operationId: 'addAlias', summary: 'Add a domain alias' })
  @ApiCreatedResponse({ description: 'Alias successfully added' })
  @ApiNotFoundResponse({ description: 'Domain not found on account' })
  private async addAlias(
    @ReqUser() user: User,
    @Param() domainParams: DomainParams,
    @Body() domainAlias: DomainAlias,
  ): Promise<void> {
    await this.domainsService.addAlias(user, domainParams.domain, domainAlias.domain)
  }

  @Delete(':domain/aliases/:alias')
  @ApiOperation({ operationId: 'deleteAlias', summary: 'Delete a domain alias' })
  @ApiCreatedResponse({ description: 'Alias successfully deleted' })
  @ApiNotFoundResponse({ description: 'Domain not found on account' })
  private async deleteAlias(@ReqUser() user: User, @Param() aliasParams: AliasParams): Promise<void> {
    await this.domainsService.deleteAlias(user, aliasParams.domain, aliasParams.alias)
  }
}
