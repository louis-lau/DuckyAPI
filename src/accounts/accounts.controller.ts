import { Controller, Get, UseGuards } from "@nestjs/common"
import { AccountsService } from "./accounts.service"
import { ApiUseTags, ApiOkResponse, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"
import { Account } from "./classes/account.class"
import { AuthGuard } from "@nestjs/passport"

@Controller("accounts")
@ApiUseTags("Accounts")
@ApiBearerAuth()
export class AccountsController {
  public constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ title: "List E-Mail accounts" })
  @ApiOkResponse({ description: "An array of accounts", type: Account, isArray: true })
  private getAccounts(): Account[] {
    return this.accountsService.getAccounts()
  }
}
