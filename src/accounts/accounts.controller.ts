import { Controller, Get, UseGuards } from "@nestjs/common"
import { AccountsService } from "./accounts.service"
import { ApiUseTags, ApiOkResponse, ApiOperation, ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger"
import { Account } from "./account.class"
import { AuthGuard } from "@nestjs/passport"

@Controller("accounts")
@ApiUseTags("Accounts")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Invalid or expired token" })
export class AccountsController {
  public constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ title: "List E-Mail accounts" })
  @ApiOkResponse({ description: "An array of accounts", type: Account, isArray: true })
  private async getAccounts(): Promise<Account[]> {
    return this.accountsService.getAccounts()
  }
}
