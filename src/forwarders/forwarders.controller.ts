import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
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

import { ForwarderDetails } from './class/forwarder-details.class'
import { Forwarder } from './class/forwarder.class'
import { CreateForwarderDto } from './dto/create-forwarder.dto'
import { UpdateForwarderDto } from './dto/update-forwarder.dto'
import { ForwardersService } from './forwarders.service'
import { ForwarderIdParams } from './params/forwarder-id.params'

@Controller('forwarders')
@ApiTags('Forwarders')
@UseGuards(AuthGuard('jwt'), RolesGuard, IsNotSuspendedGuard)
@Roles('user')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
@ApiBadRequestResponse({ description: 'Error that is resolvable user side' })
@ApiInternalServerErrorResponse({ description: 'Server error that is not resolvable user side' })
export class ForwardersController {
  public constructor(private readonly forwardersService: ForwardersService) {}

  @Delete(':forwarderId')
  @ApiOperation({ summary: 'Delete forwarder' })
  @ApiOkResponse({ description: 'Forwarder deleted successfully' })
  @ApiNotFoundResponse({ description: 'No forwarder found with this id' })
  private async deleteForwarder(@ReqUser() user: User, @Param() forwarderIdParams: ForwarderIdParams): Promise<void> {
    return this.forwardersService.deleteForwarder(user, forwarderIdParams.forwarderId)
  }

  @Get()
  @ApiOperation({ summary: 'List forwarders' })
  @ApiOkResponse({ description: 'A list of forwarders', type: Forwarder, isArray: true })
  private async getForwarders(@ReqUser() user: User): Promise<Forwarder[]> {
    return this.forwardersService.getForwarders(user)
  }

  @Get(':forwarderId')
  @ApiOperation({ summary: 'Get forwarder details' })
  @ApiOkResponse({ description: 'Forwarder details', type: ForwarderDetails })
  @ApiNotFoundResponse({ description: 'No forwarder found with this id' })
  private async getForwarderDetails(
    @ReqUser() user: User,
    @Param() forwarderIdParams: ForwarderIdParams,
  ): Promise<ForwarderDetails> {
    return this.forwardersService.getForwarderDetails(user, forwarderIdParams.forwarderId)
  }

  @Post()
  @IsNotSuspended()
  @ApiOperation({ summary: 'Create a new forwarder' })
  @ApiCreatedResponse({ description: 'Forwarder created successfully' })
  private async createForwarder(@ReqUser() user: User, @Body() createForwarderDto: CreateForwarderDto): Promise<void> {
    return this.forwardersService.createForwarder(user, createForwarderDto)
  }

  @Put(':forwarderId')
  @ApiOperation({ summary: 'Update existing forwarder' })
  @ApiOkResponse({ description: 'Forwarder updated successfully' })
  @ApiNotFoundResponse({ description: 'No forwarder found with this id' })
  private async updateForwarder(
    @ReqUser() user: User,
    @Param() forwarderIdParams: ForwarderIdParams,
    @Body() updateForwarderDto: UpdateForwarderDto,
  ): Promise<void> {
    return this.forwardersService.updateForwarder(user, forwarderIdParams.forwarderId, updateForwarderDto)
  }
}
