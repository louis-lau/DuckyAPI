import { Controller, Get, UseGuards, Post, Body, Param } from "@nestjs/common"
import { AccountsService } from "./accounts.service"
import {
  ApiUseTags,
  ApiOkResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse
} from "@nestjs/swagger"
import { Account } from "./class/account.class"
import { AuthGuard } from "@nestjs/passport"
import { CreateAccountDto } from "./dto/create-account.dto"
import { AccountDetails } from "./class/account-details.class"
import { GetAccountDetailsParams } from "./params/get-account-details.params"

@Controller("accounts")
@ApiUseTags("Accounts")
// @UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Invalid or expired token" })
@ApiBadRequestResponse({ description: "Error that is resolvable user side" })
@ApiInternalServerErrorResponse({ description: "Server error that is not resolvable user side" })
export class AccountsController {
  public constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ title: "List E-Mail accounts" })
  @ApiOkResponse({ description: "An array of accounts", type: Account, isArray: true })
  @ApiNotFoundResponse({ description: "No accounts found" })
  private async getAccounts(): Promise<Account[]> {
    return await this.accountsService.getAccounts()
  }

  @Get(":id")
  @ApiOperation({ title: "Get account details" })
  @ApiOkResponse({ description: "Account details", type: AccountDetails })
  @ApiNotFoundResponse({ description: "No account found with this id" })
  private async getAccountDetails(@Param() params: GetAccountDetailsParams): Promise<AccountDetails> {
    return await this.accountsService.getAccountDetails(params.id)
  }

  @Post()
  @ApiOperation({ title: "Create a new E-Mail account" })
  @ApiCreatedResponse({ description: "Account created successfully" })
  private async createAccount(@Body() createAccountDto: CreateAccountDto): Promise<void> {
    await this.accountsService.createAccount(createAccountDto)
  }
}
