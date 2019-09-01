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

import { AccountsService } from "./accounts.service"
import { AccountDetails } from "./class/account-details.class"
import { Account } from "./class/account.class"
import { CreateAccountDto } from "./dto/create-account.dto"
import { UpdateAccountDto } from "./dto/update-account.dto"
import { AccountIdParams } from "./params/account-id.params"

@Controller("accounts")
@ApiUseTags("Email Accounts")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Invalid or expired token" })
@ApiBadRequestResponse({ description: "Error that is resolvable user side" })
@ApiInternalServerErrorResponse({ description: "Server error that is not resolvable user side" })
export class AccountsController {
  public constructor(private readonly accountsService: AccountsService) {}

  @Delete(":accountId")
  @ApiOperation({ title: "Delete email account" })
  @ApiOkResponse({ description: "Account deleted successfully" })
  @ApiNotFoundResponse({ description: "No account found with this id" })
  private async deleteAccount(@Request() req, @Param() accountIdParams: AccountIdParams): Promise<void> {
    return this.accountsService.deleteAccount(req.user, accountIdParams.accountId)
  }

  @Get()
  @ApiOperation({ title: "List email accounts" })
  @ApiOkResponse({ description: "A list of accounts", type: Account, isArray: true })
  @ApiNotFoundResponse({ description: "No accounts found" })
  private async getAccounts(@Request() req): Promise<Account[]> {
    return this.accountsService.getAccounts(req.user)
  }

  @Get(":accountId")
  @ApiOperation({ title: "Get email account details" })
  @ApiOkResponse({ description: "Account details", type: AccountDetails })
  @ApiNotFoundResponse({ description: "No account found with this id" })
  private async getAccountDetails(@Request() req, @Param() accountIdParams: AccountIdParams): Promise<AccountDetails> {
    return this.accountsService.getAccountDetails(req.user, accountIdParams.accountId)
  }

  @Post()
  @ApiOperation({ title: "Create a new email account" })
  @ApiCreatedResponse({ description: "Account created successfully" })
  private async createAccount(@Request() req, @Body() createAccountDto: CreateAccountDto): Promise<void> {
    return this.accountsService.createAccount(req.user, createAccountDto)
  }

  @Put(":accountId")
  @ApiOperation({ title: "Update existing email account" })
  @ApiOkResponse({ description: "Account updated successfully" })
  @ApiNotFoundResponse({ description: "No account found with this id" })
  private async updateAccount(
    @Request() req,
    @Param() accountIdParams: AccountIdParams,
    @Body() updateAccountDto: UpdateAccountDto
  ): Promise<void> {
    return this.accountsService.updateAccount(req.user, accountIdParams.accountId, updateAccountDto)
  }
}
