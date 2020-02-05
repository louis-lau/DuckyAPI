import {
  BadRequestException,
  HttpService,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { AxiosResponse } from 'axios'
import { AccountsService } from 'src/accounts/accounts.service'
import { ConfigService } from 'src/config/config.service'
import { User } from 'src/users/user.entity'

import { FilterDetails } from './class/filter-details.class'
import { FilterListItem } from './class/filter-list-item.class'
import { CreateUpdateFilterDto } from './dto/create-update-filter.dto'

@Injectable()
export class FiltersService {
  private readonly logger = new Logger(FiltersService.name, true)

  public constructor(
    private readonly httpService: HttpService,
    private readonly accountsService: AccountsService,
    private readonly config: ConfigService,
  ) {}

  public async deleteFilter(user: User, accountId: string, filterId: string): Promise<void> {
    // Run get accountdetails to make sure account exists and user has permission, we don't do anything with it because it will throw an exception if needed
    await this.accountsService.getAccountDetails(user, accountId)

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .delete(`${this.config.get<string>('WILDDUCK_API_URL')}/users/${accountId}/filters/${filterId}`, {
          headers: {
            'X-Access-Token': this.config.get<string>('WILDDUCK_API_TOKEN'),
          },
        })
        .toPromise()
    } catch (error) {
      if (error.response.status === 404) {
        // TODO: remove this when the 404 gets changed to 200 with FilterNotFoundError in WildDuck
        throw new NotFoundException(`Filter: ${filterId} not found`, 'FilterNotFoundError')
      }
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case 'FilterNotFound':
          throw new NotFoundException(`Filter: ${filterId} not found`, 'FilterNotFoundError')

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException('Unknown error')
      }
    }
  }

  public async getFilters(user: User, accountId: string): Promise<FilterListItem[]> {
    // Run get accountdetails to make sure account exists and user has permission, we don't do anything with it because it will throw an exception if needed
    await this.accountsService.getAccountDetails(user, accountId)

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .get(`${this.config.get<string>('WILDDUCK_API_URL')}/users/${accountId}/filters`, {
          headers: {
            'X-Access-Token': this.config.get<string>('WILDDUCK_API_TOKEN'),
          },
        })
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException('Unknown error')
      }
    }

    if (apiResponse.data.results.length === 0) {
      return []
    }

    const filters: FilterListItem[] = []
    for (const result of apiResponse.data.results) {
      filters.push({
        id: result.id,
        name: result.name,
        disabled: result.disabled,
        created: result.created,
        action: result.action,
        query: result.query,
      })
    }
    return filters
  }

  public async getFilter(user: User, accountId: string, filterId: string): Promise<FilterDetails> {
    // Run get accountdetails to make sure account exists and user has permission, we don't do anything with it because it will throw an exception if needed
    await this.accountsService.getAccountDetails(user, accountId)

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .get(`${this.config.get<string>('WILDDUCK_API_URL')}/users/${accountId}/filters/${filterId}`, {
          headers: {
            'X-Access-Token': this.config.get<string>('WILDDUCK_API_TOKEN'),
          },
        })
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case 'FilterNotFound':
          throw new NotFoundException(`Filter: ${filterId} not found`, 'FilterNotFoundError')

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException('Unknown error')
      }
    }

    const filter: FilterDetails = {
      id: apiResponse.data.id,
      name: apiResponse.data.name,
      disabled: apiResponse.data.disabled,
      action: apiResponse.data.action,
      query: apiResponse.data.query,
    }

    return filter
  }

  public async createFilter(
    user: User,
    accountId: string,
    createUpdateFilterDto: CreateUpdateFilterDto,
  ): Promise<void> {
    // Run get accountdetails to make sure account exists and user has permission, we don't do anything with it because it will throw an exception if needed
    await this.accountsService.getAccountDetails(user, accountId)

    let apiResponse: AxiosResponse<any>
    try {
      // Pass createUpdateFilterDto directly as it's exactly what the WildDuck API requires
      apiResponse = await this.httpService
        .post(`${this.config.get<string>('WILDDUCK_API_URL')}/users/${accountId}/filters`, createUpdateFilterDto, {
          headers: {
            'X-Access-Token': this.config.get<string>('WILDDUCK_API_TOKEN'),
          },
        })
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case 'NoSuchMailbox':
          throw new BadRequestException(
            `The mailbox: ${createUpdateFilterDto.action.mailbox} does not exist on account: ${accountId}`,
            'MailboxNotFoundError',
          )

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException('Unknown error')
      }
    }
  }

  public async updateFilter(
    user: User,
    accountId: string,
    filterId: string,
    createUpdateFilterDto: CreateUpdateFilterDto,
  ): Promise<void> {
    // Run get accountdetails to make sure account exists and user has permission, we don't do anything with it because it will throw an exception if needed
    await this.accountsService.getAccountDetails(user, accountId)

    let apiResponse: AxiosResponse<any>
    try {
      // Pass createUpdateFilterDto directly as it's exactly what the WildDuck API requires
      apiResponse = await this.httpService
        .put(
          `${this.config.get<string>('WILDDUCK_API_URL')}/users/${accountId}/filters/${filterId}`,
          createUpdateFilterDto,
          {
            headers: {
              'X-Access-Token': this.config.get<string>('WILDDUCK_API_TOKEN'),
            },
          },
        )
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case 'FilterNotFound':
          throw new NotFoundException(`Filter: ${filterId} not found`, 'FilterNotFoundError')

        case 'NoSuchMailbox':
          throw new BadRequestException(
            `The mailbox: ${createUpdateFilterDto.action.mailbox} does not exist on account: ${accountId}`,
            'MailboxNotFoundError',
          )

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException('Unknown error')
      }
    }
  }
}
