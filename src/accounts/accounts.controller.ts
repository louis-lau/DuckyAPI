import { Controller, Get, UseGuards, Post, Body } from "@nestjs/common"
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
import { Account } from "./account.class"
import { AuthGuard } from "@nestjs/passport"
import { CreateAccountDto } from "./create-account.dto"

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
    return this.accountsService.getAccounts()
  }

  @Post()
  @ApiOperation({ title: "Create a new E-Mail account" })
  @ApiCreatedResponse({ description: "Account created successfully" })
  private async createAccount(@Body() createAccountDto: CreateAccountDto): Promise<void> {
    console.log(createAccountDto)
  }
}
