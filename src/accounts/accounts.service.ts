import {
  BadRequestException,
  HttpService,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common"
import { AxiosResponse } from "axios"
import { allowUnsafePasswords, maxLimits, wildDuckApiToken, wildDuckApiUrl } from "src/constants"
import { User } from "src/users/user.class"

import { AccountDetails } from "./class/account-details.class"
import { AccountListItem } from "./class/account-list-item.class"
import { CreateAccountDto } from "./dto/create-account.dto"
import { UpdateAccountDto } from "./dto/update-account.dto"

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name, true)

  public constructor(private readonly httpService: HttpService) {}

  public async getAccounts(user: User, domain?: string): Promise<AccountListItem[]> {
    if (user.domains.length === 0) {
      throw new NotFoundException(`No accounts found for user: ${user.username}`, "AccountNotFoundError")
    }

    let domainTags: string
    if (domain) {
      if (!user.domains.some((userDomain): boolean => userDomain.domain === domain)) {
        throw new BadRequestException(
          `Domain: ${domain} doesn't exist on user: ${user.username}`,
          "DomainNotFoundError"
        )
      }
      domainTags = `domain:${domain}`
    } else {
      // Comma delimited list of domains with "domain:" prefix to match the tags added to accounts
      domainTags = user.domains.map((domain): string => `domain:${domain.domain}`).join()
    }

    // Response can be anything, ignore eslint rule
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .get(`${wildDuckApiUrl}/users`, {
          headers: {
            "X-Access-Token": wildDuckApiToken
          },
          params: {
            tags: domainTags,
            limit: 250
          }
        })
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException("Backend service not reachable", "WildduckApiError")
    }

    if (apiResponse.data.results.length === 0) {
      throw new NotFoundException(`No accounts found for user: ${user.username}`, "AccountNotFoundError")
    }

    const accounts: AccountListItem[] = []
    for (const result of apiResponse.data.results) {
      accounts.push({
        id: result.id,
        name: result.name,
        address: result.address,
        quota: {
          allowed: result.quota.allowed,
          used: result.quota.used
        },
        disabled: result.disabled
      })
    }
    return accounts
  }

  public async getAccountDetails(user: User, accountId: string): Promise<AccountDetails> {
    // Response can be anything, ignore eslint rule
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .get(`${wildDuckApiUrl}/users/${accountId}`, {
          headers: {
            "X-Access-Token": wildDuckApiToken
          }
        })
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException("Backend service not reachable", "WildduckApiError")
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case "UserNotFound":
          throw new NotFoundException(`No account found with id: ${accountId}`, "AccountNotFoundError")

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }

    const addressDomain: string = apiResponse.data.address.substring(apiResponse.data.address.lastIndexOf("@") + 1)
    if (!user.domains.some((domain): boolean => domain.domain === addressDomain)) {
      // if address domain doesn't belong to user
      throw new NotFoundException(`No account found with id: ${accountId}`, "AccountNotFoundError")
    }

    return {
      id: apiResponse.data.id,
      name: apiResponse.data.name,
      address: apiResponse.data.address,
      limits: {
        quota: {
          allowed: apiResponse.data.limits.quota.allowed,
          used: apiResponse.data.limits.quota.used
        },
        send: {
          allowed: apiResponse.data.limits.recipients.allowed,
          used: apiResponse.data.limits.recipients.used,
          ttl: apiResponse.data.limits.recipients.ttl
        },
        receive: {
          allowed: apiResponse.data.limits.received.allowed,
          used: apiResponse.data.limits.received.used,
          ttl: apiResponse.data.limits.received.ttl
        },
        forward: {
          allowed: apiResponse.data.limits.forwards.allowed,
          used: apiResponse.data.limits.forwards.used,
          ttl: apiResponse.data.limits.forwards.ttl
        }
      },
      disabled: apiResponse.data.disabled,
      spamLevel: apiResponse.data.spamLevel,
      disabledScopes: apiResponse.data.disabledScopes
    }
  }

  public async createAccount(user: User, createAccountDto: CreateAccountDto): Promise<void> {
    const addressDomain = createAccountDto.address.substring(createAccountDto.address.lastIndexOf("@") + 1)
    if (!user.domains.some((domain): boolean => domain.domain === addressDomain)) {
      // if address domain doesn't belong to user
      throw new BadRequestException(
        `You don't have permission to add accounts on ${addressDomain}. Add the domain first.`,
        "DomainNotFoundError"
      )
    }

    // Response can be anything, ignore eslint rule
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .post(
          `${wildDuckApiUrl}/users`,
          {
            username: createAccountDto.address,
            name: createAccountDto.name,
            password: createAccountDto.password,
            spamLevel: createAccountDto.spamLevel,
            quota: createAccountDto.limits.quota || maxLimits.quota,
            recipients: createAccountDto.limits.send || maxLimits.send,
            receivedMax: createAccountDto.limits.receive || maxLimits.receive,
            forwards: createAccountDto.limits.forward || maxLimits.forward,
            disabledScopes: createAccountDto.disabledScopes,
            allowUnsafe: allowUnsafePasswords,
            tags: [`domain:${addressDomain}`]
          },
          {
            headers: {
              "X-Access-Token": wildDuckApiToken
            }
          }
        )
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException("Backend service not reachable", "WildduckApiError")
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case "AddressExistsError":
          throw new BadRequestException(`Address: ${createAccountDto.address} already exists`, "AddressExistsError")

        case "InsecurePasswordError":
          throw new BadRequestException(
            "The provided password has previously appeared in a data breach (https://haveibeenpwned.com/Passwords)",
            "InsecurePasswordError"
          )

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }
  }

  public async updateAccount(user: User, accountId: string, updateAccountDto: UpdateAccountDto): Promise<void> {
    // Run get accountdetails to make sure account exists and user has permission, we don't do anything with it because it will throw an exception if needed
    await this.getAccountDetails(user, accountId)

    // Response can be anything, ignore eslint rule
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .put(
          `${wildDuckApiUrl}/users/${accountId}`,
          {
            name: updateAccountDto.name,
            password: updateAccountDto.password,
            spamLevel: updateAccountDto.spamLevel,
            quota: updateAccountDto.limits.quota,
            recipients: updateAccountDto.limits.send,
            receivedMax: updateAccountDto.limits.receive,
            forwards: updateAccountDto.limits.forward,
            disabledScopes: updateAccountDto.disabledScopes,
            allowUnsafe: allowUnsafePasswords,
            disabled: updateAccountDto.disabled
          },
          {
            headers: {
              "X-Access-Token": wildDuckApiToken
            }
          }
        )
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException("Backend service not reachable", "WildduckApiError")
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case "InsecurePasswordError":
          throw new BadRequestException(
            "The provided password has previously appeared in a data breach (https://haveibeenpwned.com/Passwords)",
            "InsecurePasswordError"
          )

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }
  }

  public async deleteAccount(user: User, accountId: string): Promise<void> {
    // Run get accountdetails to make sure account exists and user has permission, we don't do anything with it because it will throw an exception if needed
    await this.getAccountDetails(user, accountId)

    // Response can be anything, ignore eslint rule
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .delete(`${wildDuckApiUrl}/users/${accountId}`, {
          headers: {
            "X-Access-Token": wildDuckApiToken
          }
        })
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException("Backend service not reachable", "WildduckApiError")
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case "UserNotFound":
          throw new NotFoundException(`No account found with id: ${accountId}`, "AccountNotFoundError")

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }
  }
}
