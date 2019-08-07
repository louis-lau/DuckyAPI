import { Controller, Get, UseGuards, Post, Body, Param, Put, Request } from "@nestjs/common"
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
import { AccountIdParams } from "./params/account-id.params"
import { UpdateAccountDto } from "./dto/update-account.dto"

@Controller("accounts")
@ApiUseTags("Email Accounts")
@UseGuards(AuthGuard("jwt"))
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
  private async getAccounts(@Request() req): Promise<Account[]> {
    return await this.accountsService.getAccounts(req.user)
  }

  @Get(":id")
  @ApiOperation({ title: "Get account details" })
  @ApiOkResponse({ description: "Account details", type: AccountDetails })
  @ApiNotFoundResponse({ description: "No account found with this id" })
  private async getAccountDetails(@Request() req, @Param() params: AccountIdParams): Promise<AccountDetails> {
    return await this.accountsService.getAccountDetails(req.user, params.id)
  }

  @Post()
  @ApiOperation({ title: "Create a new E-Mail account" })
  @ApiCreatedResponse({ description: "Account created successfully" })
  private async createAccount(@Request() req, @Body() createAccountDto: CreateAccountDto): Promise<void> {
    await this.accountsService.createAccount(req.user, createAccountDto)
  }

  @Put(":id")
  @ApiOperation({ title: "Update E-Mail account" })
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
