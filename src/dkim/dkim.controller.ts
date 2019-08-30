import { Body, Controller, Delete, Get, Param, Put, Request, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiUseTags
} from "@nestjs/swagger"
import { DomainParams } from "src/domains/domain.params"

import { DkimKey } from "./class/dkim-key.class"
import { DkimService } from "./dkim.service"
import { AddDkimDto } from "./dto/add-dkim.dto"

@Controller("domains/:domain/dkim")
@ApiUseTags("DKIM")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Invalid or expired token" })
@ApiBadRequestResponse({ description: "Error that is resolvable user side" })
@ApiInternalServerErrorResponse({ description: "Server error that is not resolvable user side" })
@ApiNotFoundResponse({ description: "Domain not found in account" })
export class DkimController {
  public constructor(private readonly dkimService: DkimService) {}

  @Delete()
  @ApiOperation({ title: "Delete DKIM key for a domain" })
  @ApiOkResponse({ description: "DKIM key successfully deleted" })
  public async deleteDkim(@Request() req, @Param() domainParams: DomainParams): Promise<void> {
    return this.dkimService.deleteDkim(req.user, domainParams.domain)
  }

  @Get()
  @ApiOperation({ title: "Get DKIM key info for a domain" })
  @ApiOkResponse({ description: "DKIM key info", type: DkimKey })
  public async getDkim(@Request() req, @Param() domainParams: DomainParams): Promise<DkimKey> {
    return this.dkimService.getDKIM(req.user, domainParams.domain)
  }

  @Put()
  @ApiOperation({ title: "Add or update DKIM key for a domain" })
  @ApiOkResponse({ description: "DKIM key info", type: DkimKey })
  public async updateDkim(
    @Request() req,
    @Body() addDkimDto: AddDkimDto,
    @Param() domainParams: DomainParams
  ): Promise<DkimKey> {
    return this.dkimService.updateDkim(req.user, addDkimDto, domainParams.domain)
  }
}
