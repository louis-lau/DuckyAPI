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
import { AccountIdParams } from 'src/accounts/params/account-id.params'
import { ReqUser } from 'src/common/decorators/req-user.decorator'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { User } from 'src/users/user.entity'

import { FilterDetails } from './class/filter-details.class'
import { FilterListItem } from './class/filter-list-item.class'
import { CreateUpdateFilterDto } from './dto/create-update-filter.dto'
import { FiltersService } from './filters.service'
import { FilterIdParams } from './params/filter-id.params'

@Controller('accounts/:accountId/filters')
@ApiTags('Filters')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('user')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
@ApiBadRequestResponse({ description: 'Error that is resolvable user side' })
@ApiInternalServerErrorResponse({ description: 'Server error that is not resolvable user side' })
export class FiltersController {
  public constructor(private readonly filtersService: FiltersService) {}

  @Delete(':filterId')
  @ApiOperation({ summary: 'Delete filter' })
  @ApiOkResponse({ description: 'Filter deleted successfully' })
  @ApiNotFoundResponse({ description: 'No account or filter found with this id' })
  public async deleteFilter(@ReqUser() user: User, @Param() filterIdParams: FilterIdParams): Promise<void> {
    return this.filtersService.deleteFilter(user, filterIdParams.accountId, filterIdParams.filterId)
  }

  @Get()
  @ApiOperation({ summary: 'List filters' })
  @ApiOkResponse({ description: 'A list of filters', type: FilterListItem, isArray: true })
  @ApiNotFoundResponse({ description: 'No account found with this id or no filters found on this account' })
  public async getFilters(@ReqUser() user: User, @Param() accountIdParams: AccountIdParams): Promise<FilterListItem[]> {
    return this.filtersService.getFilters(user, accountIdParams.accountId)
  }

  @Get(':filterId')
  @ApiOperation({ summary: 'Get filter details' })
  @ApiOkResponse({ description: 'Filter details', type: FilterDetails })
  @ApiNotFoundResponse({ description: 'No account or filter found with this id' })
  public async getFilterDetails(
    @ReqUser() user: User,
    @Param() filterIdParams: FilterIdParams,
  ): Promise<FilterDetails> {
    return this.filtersService.getFilter(user, filterIdParams.accountId, filterIdParams.filterId)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new filter' })
  @ApiCreatedResponse({ description: 'Filter created successfully' })
  @ApiNotFoundResponse({ description: 'No account found with this id' })
  public async createFilter(
    @ReqUser() user: User,
    @Param() accountIdParams: AccountIdParams,
    @Body() createUpdateFilterDto: CreateUpdateFilterDto,
  ): Promise<void> {
    return this.filtersService.createFilter(user, accountIdParams.accountId, createUpdateFilterDto)
  }

  @Put(':filterId')
  @ApiOperation({ summary: 'Update existing filter' })
  @ApiOkResponse({ description: 'Account updated successfully' })
  @ApiNotFoundResponse({ description: 'No account or filter found with this id' })
  public async updateFilter(
    @ReqUser() user: User,
    @Param() filterIdParams: FilterIdParams,
    @Body() createUpdateFilterDto: CreateUpdateFilterDto,
  ): Promise<void> {
    return this.filtersService.updateFilter(
      user,
      filterIdParams.accountId,
      filterIdParams.filterId,
      createUpdateFilterDto,
    )
  }
}
