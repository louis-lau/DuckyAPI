import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
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

import { AccountsService } from './accounts.service'
import { AccountDetails } from './class/account-details.class'
import { AccountListItem } from './class/account-list-item.class'
import { Address } from './class/address.class'
import { CreateAccountDto } from './dto/create-account.dto'
import { UpdateAccountDto } from './dto/update-account.dto'
import { AccountAliasParams } from './params/account-alias.params'
import { AccountIdParams } from './params/account-id.params'

@Controller('accounts')
@ApiTags('Email Accounts')
@UseGuards(AuthGuard('jwt'), RolesGuard, IsNotSuspendedGuard)
@Roles('user')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
@ApiBadRequestResponse({ description: 'Bad user input' })
export class AccountsController {
  public constructor(private readonly accountsService: AccountsService) {}

  @Delete(':accountId')
  @ApiOperation({ operationId: 'deleteAccount', summary: 'Delete email account' })
  @ApiOkResponse({ description: 'Account deleted successfully' })
  @ApiNotFoundResponse({ description: 'No account found with this id' })
  private async deleteAccount(@ReqUser() user: User, @Param() accountIdParams: AccountIdParams): Promise<void> {
    return this.accountsService.deleteAccount(user, accountIdParams.accountId)
  }

  @Get()
  @ApiOperation({ operationId: 'getAccounts', summary: 'List email accounts' })
  @ApiOkResponse({ description: 'A list of accounts', type: AccountListItem, isArray: true })
  private async getAccounts(@ReqUser() user: User): Promise<AccountListItem[]> {
    return this.accountsService.getAccounts(user)
  }

  @Get(':accountId')
  @ApiOperation({ operationId: 'getAccountDetails', summary: 'Get email account details' })
  @ApiOkResponse({ description: 'Account details', type: AccountDetails })
  @ApiNotFoundResponse({ description: 'No account found with this id' })
  private async getAccountDetails(
    @ReqUser() user: User,
    @Param() accountIdParams: AccountIdParams,
  ): Promise<AccountDetails> {
    return this.accountsService.getAccountDetails(user, accountIdParams.accountId)
  }

  @Post()
  @IsNotSuspended()
  @ApiOperation({ operationId: 'createAccount', summary: 'Create a new email account' })
  @ApiCreatedResponse({ description: 'Account created successfully' })
  private async createAccount(@ReqUser() user: User, @Body() createAccountDto: CreateAccountDto): Promise<void> {
    return this.accountsService.createAccount(user, createAccountDto)
  }

  @Put(':accountId')
  @ApiOperation({ operationId: 'updateAccount', summary: 'Update existing email account' })
  @ApiOkResponse({ description: 'Account updated successfully' })
  @ApiNotFoundResponse({ description: 'No account found with this id' })
  private async updateAccount(
    @ReqUser() user: User,
    @Param() accountIdParams: AccountIdParams,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<void> {
    return this.accountsService.updateAccount(user, accountIdParams.accountId, updateAccountDto)
  }

  @Post(':accountId/aliases')
  @IsNotSuspended()
  @ApiOperation({ operationId: 'addAccountAlias', summary: 'Add an account alias' })
  @ApiCreatedResponse({ description: 'Alias successfully added' })
  @ApiNotFoundResponse({ description: 'No account found with this id' })
  private async addAlias(
    @ReqUser() user: User,
    @Param() accountIdParams: AccountIdParams,
    @Body() address: Address,
  ): Promise<void> {
    return this.accountsService.addAlias(user, accountIdParams.accountId, address)
  }

  @Delete(':accountId/aliases/:aliasId')
  @ApiOperation({ operationId: 'deleteAccountAlias', summary: 'Delete an account alias' })
  @ApiOkResponse({ description: 'Alias successfully deleted' })
  @ApiNotFoundResponse({ description: 'No account or alias found with this id' })
  private async deleteAlias(@ReqUser() user: User, @Param() accountAliasParams: AccountAliasParams): Promise<void> {
    return this.accountsService.deleteAlias(user, accountAliasParams.accountId, accountAliasParams.aliasId)
  }
}
