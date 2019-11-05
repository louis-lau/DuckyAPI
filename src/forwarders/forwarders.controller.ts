import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common"
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

import { ForwarderDetails } from "./class/forwarder-details.class"
import { Forwarder } from "./class/forwarder.class"
import { CreateForwarderDto } from "./dto/create-forwarder.dto"
import { UpdateForwarderDto } from "./dto/update-forwarder.dto"
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
  private async deleteForwarder(@ReqUser() user: User, @Param() forwarderIdParams: ForwarderIdParams): Promise<void> {
    return this.forwardersService.deleteForwarder(user, forwarderIdParams.forwarderId)
  }

  @Get()
  @ApiOperation({ title: "List forwarders" })
  @ApiOkResponse({ description: "A list of forwarders", type: Forwarder, isArray: true })
  @ApiNotFoundResponse({ description: "No forwarders found" })
  private async getForwarders(@ReqUser() user: User): Promise<Forwarder[]> {
    return this.forwardersService.getForwarders(user)
  }

  @Get(":forwarderId")
  @ApiOperation({ title: "Get forwarder details" })
  @ApiOkResponse({ description: "Forwarder details", type: ForwarderDetails })
  @ApiNotFoundResponse({ description: "No forwarder found with this id" })
  private async getForwarderDetails(
    @ReqUser() user: User,
    @Param() forwarderIdParams: ForwarderIdParams
  ): Promise<ForwarderDetails> {
    return this.forwardersService.getForwarderDetails(user, forwarderIdParams.forwarderId)
  }

  @Post()
  @ApiOperation({ title: "Create a new forwarder" })
  @ApiCreatedResponse({ description: "Forwarder created successfully" })
  private async createForwarder(@ReqUser() user: User, @Body() createForwarderDto: CreateForwarderDto): Promise<void> {
    return this.forwardersService.createForwarder(user, createForwarderDto)
  }

  @Put(":forwarderId")
  @ApiOperation({ title: "Update existing forwarder" })
  @ApiOkResponse({ description: "Forwarder updated successfully" })
  @ApiNotFoundResponse({ description: "No forwarder found with this id" })
  private async updateForwarder(
    @ReqUser() user: User,
    @Param() forwarderIdParams: ForwarderIdParams,
    @Body() updateForwarderDto: UpdateForwarderDto
  ): Promise<void> {
    return this.forwardersService.updateForwarder(user, forwarderIdParams.forwarderId, updateForwarderDto)
  }
}
