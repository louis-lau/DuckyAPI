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
  ApiUnauthorizedResponse,
  ApiUseTags,
} from '@nestjs/swagger'
import { ReqUser } from 'src/common/decorators/req-user.decorator'
import { User } from 'src/users/class/user.class'

import { AccountsService } from './accounts.service'
import { AccountDetails } from './class/account-details.class'
import { AccountListItem } from './class/account-list-item.class'
import { CreateAccountDto } from './dto/create-account.dto'
import { UpdateAccountDto } from './dto/update-account.dto'
import { AccountIdParams } from './params/account-id.params'

@Controller('accounts')
@ApiUseTags('Email Accounts')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
@ApiBadRequestResponse({ description: 'Error that is resolvable user side' })
@ApiInternalServerErrorResponse({ description: 'Server error that is not resolvable user side' })
export class AccountsController {
  public constructor(private readonly accountsService: AccountsService) {}

  @Delete(':accountId')
  @ApiOperation({ title: 'Delete email account' })
  @ApiOkResponse({ description: 'Account deleted successfully' })
  @ApiNotFoundResponse({ description: 'No account found with this id' })
  private async deleteAccount(@ReqUser() user: User, @Param() accountIdParams: AccountIdParams): Promise<void> {
    return this.accountsService.deleteAccount(user, accountIdParams.accountId)
  }

  @Get()
  @ApiOperation({ title: 'List email accounts' })
  @ApiOkResponse({ description: 'A list of accounts', type: AccountListItem, isArray: true })
  @ApiNotFoundResponse({ description: 'No accounts found' })
  private async getAccounts(@ReqUser() user: User): Promise<AccountListItem[]> {
    return this.accountsService.getAccounts(user)
  }

  @Get(':accountId')
  @ApiOperation({ title: 'Get email account details' })
  @ApiOkResponse({ description: 'Account details', type: AccountDetails })
  @ApiNotFoundResponse({ description: 'No account found with this id' })
  private async getAccountDetails(
    @ReqUser() user: User,
    @Param() accountIdParams: AccountIdParams,
  ): Promise<AccountDetails> {
    return this.accountsService.getAccountDetails(user, accountIdParams.accountId)
  }

  @Post()
  @ApiOperation({ title: 'Create a new email account' })
  @ApiCreatedResponse({ description: 'Account created successfully' })
  private async createAccount(@ReqUser() user: User, @Body() createAccountDto: CreateAccountDto): Promise<void> {
    return this.accountsService.createAccount(user, createAccountDto)
  }

  @Put(':accountId')
  @ApiOperation({ title: 'Update existing email account' })
  @ApiOkResponse({ description: 'Account updated successfully' })
  @ApiNotFoundResponse({ description: 'No account found with this id' })
  private async updateAccount(
    @ReqUser() user: User,
    @Param() accountIdParams: AccountIdParams,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<void> {
    return this.accountsService.updateAccount(user, accountIdParams.accountId, updateAccountDto)
  }
}
