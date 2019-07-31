import { Injectable, HttpService, NotFoundException, Logger, InternalServerErrorException } from "@nestjs/common"
import { wildDuckApiUrl, wildDuckApiToken } from "src/constants"
import { Account } from "./account.class"
import { AxiosResponse } from "axios"

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name, true)

  public constructor(private readonly httpService: HttpService) {}

  public async getAccounts(): Promise<Account[]> {
    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .get(`${wildDuckApiUrl}/users`, {
          headers: {
            "X-Access-Token": wildDuckApiToken
          },
          params: {
            limit: 250
          }
        })
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException("Backend service not reachable")
    }

    if (apiResponse.data.results.length === 0) {
      throw new NotFoundException("No accounts found")
    }

    let accounts: Account[] = []
    for (const result of apiResponse.data.results) {
      accounts.push({
        id: result.id,
        name: result.name,
        address: result.address,
        quotaAllowed: result.quota.allowed,
        quotaUsed: result.quota.used,
        disabled: result.disabled
      })
    }
    return accounts
  }
}
