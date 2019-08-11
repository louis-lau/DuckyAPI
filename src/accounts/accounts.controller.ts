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

  @Delete(":id")
  @ApiOperation({ title: "Delete email account" })
  @ApiOkResponse({ description: "Account deleted successfully" })
  @ApiNotFoundResponse({ description: "No account found with this id" })
  private async deleteAccount(@Request() req, @Param() params: AccountIdParams): Promise<void> {
    return await this.accountsService.deleteAccount(req.user, params.id)
  }

  @Get()
  @ApiOperation({ title: "List E-Mail accounts" })
  @ApiOkResponse({ description: "A list of accounts", type: Account, isArray: true })
  @ApiNotFoundResponse({ description: "No accounts found" })
  private async getAccounts(@Request() req): Promise<Account[]> {
    return await this.accountsService.getAccounts(req.user)
  }

  @Get(":id")
  @ApiOperation({ title: "Get email account details" })
  @ApiOkResponse({ description: "Account details", type: AccountDetails })
  @ApiNotFoundResponse({ description: "No account found with this id" })
  private async getAccountDetails(@Request() req, @Param() params: AccountIdParams): Promise<AccountDetails> {
    return await this.accountsService.getAccountDetails(req.user, params.id)
  }

  @Post()
  @ApiOperation({ title: "Create a new email account" })
  @ApiCreatedResponse({ description: "Account created successfully" })
  private async createAccount(@Request() req, @Body() createAccountDto: CreateAccountDto): Promise<void> {
    await this.accountsService.createAccount(req.user, createAccountDto)
  }

  @Put(":id")
  @ApiOperation({ title: "Update email account" })
  @ApiOkResponse({ description: "Account updated successfully" })
  @ApiNotFoundResponse({ description: "No account found with this id" })
  private async updateAccount(
    @Request() req,
    @Param() params: AccountIdParams,
    @Body() updateAccountDto: UpdateAccountDto
  ): Promise<void> {
    await this.accountsService.updateAccount(req.user, params.id, updateAccountDto)
  }
}
