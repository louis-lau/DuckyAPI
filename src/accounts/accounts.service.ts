import {
  BadRequestException,
  HttpService,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { AxiosResponse } from 'axios'
import { nanoid as NanoId } from 'nanoid'
import { ConfigService } from 'src/config/config.service'
import { DomainsService } from 'src/domains/domains.service'
import { User } from 'src/users/user.entity'

import { AccountDetails } from './class/account-details.class'
import { AccountListItem } from './class/account-list-item.class'
import { Address } from './class/address.class'
import { CreateAccountDto } from './dto/create-account.dto'
import { CreateUpdateAccountLimits } from './dto/create-update-common.dto'
import { UpdateAccountDto } from './dto/update-account.dto'

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name, true)

  public constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly domainsService: DomainsService,
  ) {}

  public async getAccounts(user: User, domain?: string): Promise<AccountListItem[]> {
    if (user.domains.length === 0) {
      return []
    }

    let domainTags: string
    if (domain) {
      await this.domainsService.checkIfDomainIsAddedToUser(user, domain)
      domainTags = `domain:${domain}`
    } else {
      // Comma delimited list of domains with "domain:" prefix to match the tags added to accounts
      domainTags = user.domains.map((domain): string => `domain:${domain.domain}`).join()
    }

    let results: any[] = []
    let nextCursor: string | false

    // Loop until no more pages
    while (true) {
      let apiResponse: AxiosResponse<any>
      try {
        apiResponse = await this.httpService
          .get(`/users`, {
            params: {
              tags: domainTags,
              limit: 250,
              next: nextCursor,
            },
          })
          .toPromise()
      } catch (error) {
        this.logger.error(error.message)
        throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
      }
      if (apiResponse.data.results.length === 0) {
        return []
      }

      // Add results of this page to the results array
      results = results.concat(apiResponse.data.results)

      if (apiResponse.data.nextCursor) {
        // Set next cursor value and repeat
        nextCursor = apiResponse.data.nextCursor
      } else {
        break
      }
    }

    const aliasesForUser = await this.getAliases(user)

    const accounts: AccountListItem[] = []
    for (const result of results) {
      const aliasesForAccount = aliasesForUser.filter((address) => address.user === result.id)
      accounts.push({
        id: result.id,
        name: result.name,
        address: result.address,
        aliases: aliasesForAccount.map((address) => ({
          id: address.id,
          name: address.name !== false ? address.name : undefined,
          address: address.address,
        })),
        quota: {
          allowed: result.quota.allowed,
          used: result.quota.used,
        },
        disabled: result.disabled,
      })
    }
    return accounts
  }

  public async getAccountDetails(user: User, accountId: string): Promise<AccountDetails> {
    let accountApiResponse: AxiosResponse<any>
    try {
      accountApiResponse = await this.httpService.get(`/users/${accountId}`).toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    if (accountApiResponse.data.error || !accountApiResponse.data.success) {
      switch (accountApiResponse.data.code) {
        case 'UserNotFound':
          throw new NotFoundException(`No account found with id: ${accountId}`, 'AccountNotFoundError')

        default:
          this.logger.error(accountApiResponse.data)
          throw new InternalServerErrorException('Unknown error')
      }
    }

    const addressDomain: string = accountApiResponse.data.address.substring(
      accountApiResponse.data.address.lastIndexOf('@') + 1,
    )
    if (!user.domains.some((domain): boolean => domain.domain === addressDomain)) {
      // if address domain doesn't belong to user
      throw new NotFoundException(`No account found with id: ${accountId}`, 'AccountNotFoundError')
    }

    let aliasApiResponse: AxiosResponse<any>
    try {
      aliasApiResponse = await this.httpService.get(`/users/${accountId}/addresses`).toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    if (aliasApiResponse.data.error || !aliasApiResponse.data.success) {
      switch (aliasApiResponse.data.code) {
        case 'UserNotFound':
          throw new NotFoundException(`No account found with id: ${accountId}`, 'AccountNotFoundError')

        default:
          this.logger.error(aliasApiResponse.data)
          throw new InternalServerErrorException('Unknown error')
      }
    }

    const aliases = aliasApiResponse.data.results.filter((address) => address.tags.includes('alias'))

    return {
      id: accountApiResponse.data.id,
      name: accountApiResponse.data.name,
      address: accountApiResponse.data.address,
      aliases: aliases.map((address) => ({
        id: address.id,
        name: address.name,
        address: address.address,
      })),
      limits: {
        quota: {
          allowed: accountApiResponse.data.limits.quota.allowed,
          used: accountApiResponse.data.limits.quota.used,
        },
        send: {
          allowed: accountApiResponse.data.limits.recipients.allowed,
          used: accountApiResponse.data.limits.recipients.used,
          ttl: accountApiResponse.data.limits.recipients.ttl,
        },
        receive: {
          allowed: accountApiResponse.data.limits.received.allowed,
          used: accountApiResponse.data.limits.received.used,
          ttl: accountApiResponse.data.limits.received.ttl,
        },
        forward: {
          allowed: accountApiResponse.data.limits.forwards.allowed,
          used: accountApiResponse.data.limits.forwards.used,
          ttl: accountApiResponse.data.limits.forwards.ttl,
        },
      },
      disabled: accountApiResponse.data.disabled,
      spamLevel: accountApiResponse.data.spamLevel,
      disabledScopes: accountApiResponse.data.disabledScopes,
    }
  }

  private async validateLimitsOrFail(user: User, limits: CreateUpdateAccountLimits): Promise<void> {
    if (limits.send && user.maxSend !== 0 && limits.send > user.maxSend) {
      throw new BadRequestException(`Send limit may not be higher than ${user.maxSend}`, 'ValidationError')
    }
    if (limits.receive && user.maxReceive !== 0 && limits.receive > user.maxReceive) {
      throw new BadRequestException(`Receive limit may not be higher than ${user.maxReceive}`, 'ValidationError')
    }
    if (limits.forward && user.maxForward !== 0 && limits.forward > user.maxForward) {
      throw new BadRequestException(`Forward limit may not be higher than ${user.maxForward}`, 'ValidationError')
    }
  }

  public async createAccount(user: User, createAccountDto: CreateAccountDto): Promise<void> {
    const addressDomain = createAccountDto.address.substring(createAccountDto.address.lastIndexOf('@') + 1)
    if (!user.domains.some((domain): boolean => domain.domain === addressDomain)) {
      // if address domain doesn't belong to user
      throw new BadRequestException(
        `You don't have permission to add accounts on ${addressDomain}. Add the domain first.`,
        'DomainNotFoundError',
      )
    }

    if (createAccountDto.limits) {
      await this.validateLimitsOrFail(user, createAccountDto.limits)
    }

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .post(`/users`, {
          username: NanoId(),
          address: createAccountDto.address,
          name: createAccountDto.name,
          password: createAccountDto.password,
          spamLevel: createAccountDto.spamLevel,
          quota: createAccountDto.limits.quota || user.quota,
          recipients: createAccountDto.limits.send || user.maxSend,
          receivedMax: createAccountDto.limits.receive || user.maxReceive,
          forwards: createAccountDto.limits.forward || user.maxForward,
          disabledScopes: createAccountDto.disabledScopes,
          allowUnsafe: this.config.ALLOW_UNSAFE_ACCOUNT_PASSWORDS,
          tags: [`domain:${addressDomain}`],
        })
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case 'AddressExistsError':
        case 'UserExistsError':
          throw new BadRequestException(`Address: ${createAccountDto.address} already exists`, 'AddressExistsError')

        case 'InsecurePasswordError':
          throw new BadRequestException(
            'The provided password has previously appeared in a data breach (https://haveibeenpwned.com/Passwords)',
            'InsecurePasswordError',
          )

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException('Unknown error')
      }
    }
  }

  public async updateAccount(user: User, accountId: string, updateAccountDto: UpdateAccountDto): Promise<void> {
    // Run get accountdetails to make sure account exists and user has permission, we don't do anything with it because it will throw an exception if needed
    await this.getAccountDetails(user, accountId)

    if (updateAccountDto.limits) {
      await this.validateLimitsOrFail(user, updateAccountDto.limits)
    }

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .put(`/users/${accountId}`, {
          name: updateAccountDto.name,
          password: updateAccountDto.password,
          spamLevel: updateAccountDto.spamLevel,
          quota: updateAccountDto.limits.quota,
          recipients: updateAccountDto.limits.send,
          receivedMax: updateAccountDto.limits.receive,
          forwards: updateAccountDto.limits.forward,
          disabledScopes: updateAccountDto.disabledScopes,
          allowUnsafe: this.config.ALLOW_UNSAFE_ACCOUNT_PASSWORDS,
          disabled: updateAccountDto.disabled,
        })
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case 'InsecurePasswordError':
          throw new BadRequestException(
            'The provided password has previously appeared in a data breach (https://haveibeenpwned.com/Passwords)',
            'InsecurePasswordError',
          )

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException('Unknown error')
      }
    }
  }

  public async suspend(accountId: string, suspend = true): Promise<void> {
    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .put(`/users/${accountId}`, {
          suspended: suspend,
        })
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case 'UserNotFound':
          break

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException('Unknown error')
      }
    }
  }

  public async deleteAccount(user: User, accountId: string): Promise<void> {
    // Run get accountdetails to make sure account exists and user has permission, we don't do anything with it because it will throw an exception if needed
    await this.getAccountDetails(user, accountId)

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService.delete(`/users/${accountId}`).toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case 'UserNotFound':
          throw new NotFoundException(`No account found with id: ${accountId}`, 'AccountNotFoundError')

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException('Unknown error')
      }
    }
  }

  public async getAliases(user: User, domain?: string): Promise<Record<string, any>[]> {
    if (user.domains.length === 0) {
      return []
    }

    let domainTags: string
    if (domain) {
      await this.domainsService.checkIfDomainIsAddedToUser(user, domain)
      domainTags = `domain:${domain}`
    } else {
      // Comma delimited list of domains with "domain:" prefix to match the tags added to accounts
      domainTags = user.domains.map((domain): string => `domain:${domain.domain}`).join()
    }

    let results: any[] = []
    let nextCursor: string | false

    // Loop until no more pages
    while (true) {
      let apiResponse: AxiosResponse<any>
      try {
        apiResponse = await this.httpService
          .get(`/addresses`, {
            params: {
              tags: domainTags,
              requiredTags: 'alias',
              limit: 250,
              next: nextCursor,
            },
          })
          .toPromise()
      } catch (error) {
        this.logger.error(error.message)
        throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
      }
      if (apiResponse.data.results.length === 0) {
        return []
      }

      // Add results of this page to the results array
      results = results.concat(apiResponse.data.results)

      if (apiResponse.data.nextCursor) {
        // Set next cursor value and repeat
        nextCursor = apiResponse.data.nextCursor
      } else {
        break
      }
    }
    return results
  }

  public async addAlias(user: User, accountId: string, address: Address): Promise<void> {
    // Run get accountdetails to make sure account exists and user has permission, we don't do anything with it because it will throw an exception if needed
    await this.getAccountDetails(user, accountId)

    const addressDomain = address.address.substring(address.address.lastIndexOf('@') + 1)
    if (!user.domains.some((domain): boolean => domain.domain === addressDomain)) {
      // if address domain doesn't belong to user
      throw new BadRequestException(
        `You don't have permission to add aliases on ${addressDomain}. Add the domain first.`,
        'DomainNotFoundError',
      )
    }

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .post(`/users/${accountId}/addresses`, {
          name: address.name || '',
          address: address.address,
          tags: [`domain:${addressDomain}`, 'alias'],
        })
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case 'AddressExistsError':
        case 'UserExistsError':
          throw new BadRequestException(`Address: ${address.address} already exists`, 'AddressExistsError')

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException('Unknown error')
      }
    }
  }

  public async deleteAlias(user: User, accountId: string, aliasId: string): Promise<void> {
    // Run get accountdetails to make sure account exists and user has permission, we don't do anything with it because it will throw an exception if needed
    await this.getAccountDetails(user, accountId)

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService.delete(`/users/${accountId}/addresses/${aliasId}`).toPromise()
    } catch (error) {
      switch (error.response.data.code) {
        case 'AddressNotFound':
          throw new NotFoundException(`No alias found with id: ${aliasId}`, 'AliasNotFoundError')

        default:
          this.logger.error(error.message)
          throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
      }
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case 'UserNotFound':
          throw new NotFoundException(`No account found with id: ${accountId}`, 'AccountNotFoundError')

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException('Unknown error')
      }
    }
  }
}
