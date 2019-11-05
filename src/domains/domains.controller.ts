import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiUseTags
} from "@nestjs/swagger"
import { ReqUser } from "src/common/decorators/req-user.decorator"
import { User } from "src/users/class/user.class"

import { DnsCheck } from "./class/dns.class"
import { Domain } from "./class/domain.class"
import { DomainsService } from "./domains.service"
import { DomainDto } from "./dto/domain.dto"
import { DomainParams } from "./params/domain.params"

@Controller("domains")
@ApiUseTags("Domains")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Invalid or expired token" })
@ApiBadRequestResponse({ description: "Error that is resolvable user side" })
@ApiInternalServerErrorResponse({ description: "Server error that is not resolvable user side" })
export class DomainsController {
  public constructor(private readonly domainsService: DomainsService) {}
  @Delete(":domain")
  @ApiOperation({
    title: "Remove domain",
    description:
      "WARNING: This will also remove any email accounts, forwarders, and DKIM keys associated with this domain"
  })
  @ApiOkResponse({ description: "Domain successfully removed" })
  @ApiNotFoundResponse({ description: "Domain not found on account" })
  private async deleteDomain(@ReqUser() user: User, @Param() domainParams: DomainParams): Promise<void> {
    return this.domainsService.deleteDomain(user, domainParams.domain)
  }

  @Get()
  @ApiOperation({ title: "List domains" })
  @ApiOkResponse({ description: "A list of domains", type: Domain, isArray: true })
  @ApiNotFoundResponse({ description: "No domains found" })
  private async getDomains(@ReqUser() user: User): Promise<Domain[]> {
    return this.domainsService.getDomains(user)
  }

  @Get(":domain/DNS")
  @ApiOperation({ title: "Get and check DNS records" })
  @ApiOkResponse({ description: "The current and the correct DNS records for this domain", type: DnsCheck })
  @ApiNotFoundResponse({ description: "Domain not found on account" })
  private async checkDNS(@ReqUser() user: User, @Param() domainParams: DomainParams): Promise<DnsCheck> {
    return this.domainsService.checkDns(user, domainParams.domain)
  }

  @Post()
  @ApiOperation({ title: "Add domain" })
  @ApiCreatedResponse({ description: "Domain successfully added" })
  private async addDomain(@ReqUser() user: User, @Body() domainDto: DomainDto): Promise<void> {
    return this.domainsService.addDomain(user, domainDto.domain)
  }
}
