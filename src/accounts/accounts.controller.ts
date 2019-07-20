import { Controller, Get } from "@nestjs/common"
import { AccountsService } from "./accounts.service"
import { ApiUseTags, ApiOkResponse, ApiOperation } from "@nestjs/swagger"
import { Account } from "./classes/account.class"

@Controller("accounts")
@ApiUseTags("Accounts")
export class AccountsController {
  public constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ title: "List E-Mail accounts" })
  @ApiOkResponse({ description: "An array of accounts", type: Account, isArray: true })
  private getAccounts(): Account[] {
    return this.accountsService.getAccounts()
  }
}
