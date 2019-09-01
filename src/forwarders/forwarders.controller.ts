import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from "@nestjs/common"
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

import { ForwarderDetails } from "./class/forwarder-details.class"
import { Forwarder } from "./class/forwarder.class"
import { CreateUpdateForwarderDto } from "./dto/create-update-forwarder.dto"
import { ForwardersService } from "./forwarders.service"
import { ForwarderIdParams } from "./params/forwarder-id.params"

@Controller("forwarders")
@ApiUseTags("Forwarders")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Invalid or expired token" })
@ApiBadRequestResponse({ description: "Error that is resolvable user side" })
@ApiInternalServerErrorResponse({ description: "Server error that is not resolvable user side" })
export class ForwardersController {
  public constructor(private readonly forwardersService: ForwardersService) {}

  @Delete(":forwarderId")
  @ApiOperation({ title: "Delete forwarder" })
  @ApiOkResponse({ description: "Forwarder deleted successfully" })
  @ApiNotFoundResponse({ description: "No forwarder found with this id" })
  private async deleteForwarder(@Request() req, @Param() forwarderIdParams: ForwarderIdParams): Promise<void> {
    // return await this.forwardersService.deleteForwarder(req.user, forwarderIdParams.forwarderId)
  }

  @Get()
  @ApiOperation({ title: "List forwarders" })
  @ApiOkResponse({ description: "A list of forwarders", type: Forwarder, isArray: true })
  @ApiNotFoundResponse({ description: "No forwarders found" })
  private async getForwarders(@Request() req): Promise<Forwarder[]> {
    // return await this.forwardersService.getForwarders(req.user)
  }

  @Get(":forwarderId")
  @ApiOperation({ title: "Get forwarder details" })
  @ApiOkResponse({ description: "Forwarder details", type: ForwarderDetails })
  @ApiNotFoundResponse({ description: "No forwarder found with this id" })
  private async getForwarderDetails(
    @Request() req,
    @Param() forwarderIdParams: ForwarderIdParams
  ): Promise<ForwarderDetails> {
    // return await this.forwardersService.getForwarderDetails(req.user, forwarderIdParams.forwarderId)
  }

  @Post()
  @ApiOperation({ title: "Create a new forwarder" })
  @ApiCreatedResponse({ description: "Forwarder created successfully" })
  private async createForwarder(
    @Request() req,
    @Body() createUpdateForwarderDto: CreateUpdateForwarderDto
  ): Promise<void> {
    await this.forwardersService.createForwarder(req.user, createUpdateForwarderDto)
  }

  @Put(":forwarderId")
  @ApiOperation({ title: "Update existing forwarder" })
  @ApiOkResponse({ description: "Forwarder updated successfully" })
  @ApiNotFoundResponse({ description: "No forwarder found with this id" })
  private async updateForwarder(
    @Request() req,
    @Param() forwarderIdParams: ForwarderIdParams,
    @Body() createUpdateForwarderDto: CreateUpdateForwarderDto
  ): Promise<void> {
    await this.forwardersService.updateForwarder(req.user, forwarderIdParams.forwarderId, createUpdateForwarderDto)
  }
}
