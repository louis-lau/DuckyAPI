import { HttpService, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common"
import { AxiosResponse } from "axios"
import { AccountsService } from "src/accounts/accounts.service"
import { wildDuckApiToken, wildDuckApiUrl } from "src/constants"
import { User } from "src/users/user.class"

import { FilterListItem } from "./class/filter-list-item.class"

@Injectable()
export class FiltersService {
  private readonly logger = new Logger(FiltersService.name, true)

  public constructor(private readonly httpService: HttpService, private readonly accountsService: AccountsService) {}

  public async getFilters(user: User, accountId: string): Promise<FilterListItem[]> {
    // Run get accountdetails to make sure account exists and user has permission, we don't do anything with it because it will throw an exception if needed
    await this.accountsService.getAccountDetails(user, accountId)

    // Response can be anything, ignore eslint rule
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .get(`${wildDuckApiUrl}/users/${accountId}/filters`, {
          headers: {
            "X-Access-Token": wildDuckApiToken
          }
        })
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException("Backend service not reachable")
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }

    if (apiResponse.data.results.length === 0) {
      throw new NotFoundException(`No filters found for account: ${accountId}`)
    }

    const filters: FilterListItem[] = []
    for (const result of apiResponse.data.results) {
      filters.push({
        id: result.id,
        name: result.name,
        disabled: result.disabled,
        created: result.created,
        action: result.action,
        query: result.query
      })
    }
    return filters
  }
}
