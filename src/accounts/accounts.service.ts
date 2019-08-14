import {
  BadRequestException,
  HttpService,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common"
import { AxiosResponse } from "axios"
import { allowUnsafePasswords, wildDuckApiToken, wildDuckApiUrl } from "src/constants"
import { User } from "src/users/user.class"

import { AccountDetails } from "./class/account-details.class"
import { Account } from "./class/account.class"
import { CreateAccountDto } from "./dto/create-account.dto"
import { UpdateAccountDto } from "./dto/update-account.dto"

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name, true)

  public constructor(private readonly httpService: HttpService) {}

  public async getAccounts(user: User, domain?: string): Promise<Account[]> {
    if (user.domains.length === 0) {
      throw new NotFoundException(`No accounts found for user: ${user.username}`)
    }

    let domainTags: string
    if (domain) {
      if (!user.domains.some((userDomain): boolean => userDomain.domain === domain)) {
        throw new BadRequestException(`Domain: ${domain} doesn't exist on user: ${user.username}`)
      }
      domainTags = `domain:${domain}`
    } else {
      domainTags = user.domains.map((domain): string => `domain:${domain.domain}`).join()
    }
    // Comma delimited list of domains with "domain:" prefix to match the tags added to accounts

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
      throw new InternalServerErrorException("Backend service not reachable")
    }

    if (apiResponse.data.results.length === 0) {
      throw new NotFoundException(`No accounts found for user: ${user.username}`)
    }

    const accounts: Account[] = []
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

  public async getAccountDetails(user: User, id: string): Promise<AccountDetails> {
    // Response can be anything, ignore eslint rule
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .get(`${wildDuckApiUrl}/users/${id}`, {
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
        case "UserNotFound":
          throw new NotFoundException(`No account found with id: ${id}`)

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }

    const addressDomain: string = apiResponse.data.address.substring(apiResponse.data.address.lastIndexOf("@") + 1)
    if (!user.domains.some((domain): boolean => domain.domain === addressDomain)) {
      // if address domain doesn't belong to user
      throw new NotFoundException(`No account found with id: ${id}`)
    }

    return {
      id: apiResponse.data.id,
      name: apiResponse.data.name,
      address: apiResponse.data.address,
      quotaAllowed: apiResponse.data.limits.quota.allowed,
      quotaUsed: apiResponse.data.limits.quota.used,
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
        `You don't have permission to add accounts on ${addressDomain}. Add the domain first.`
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
            quota: createAccountDto.quotaAllowed,
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
      throw new InternalServerErrorException("Backend service not reachable")
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case "AddressExistsError":
          throw new BadRequestException(`Email account: ${createAccountDto.address} already exists`)

        case "InsecurePasswordError":
          throw new BadRequestException(
            "The provided password has previously appeared in a data breach (https://haveibeenpwned.com/Passwords)"
          )

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }
  }

  public async updateAccount(user: User, id: string, updateAccountDto: UpdateAccountDto): Promise<void> {
    // Run get accountdetails to make sure account exists and user has permission, we don't do anything with it because it will throw an exception if needed
    await this.getAccountDetails(user, id)

    // Response can be anything, ignore eslint rule
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .put(
          `${wildDuckApiUrl}/users/${id}`,
          {
            name: updateAccountDto.name,
            password: updateAccountDto.password,
            spamLevel: updateAccountDto.spamLevel,
            quota: updateAccountDto.quotaAllowed,
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
      throw new InternalServerErrorException("Backend service not reachable")
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case "InsecurePasswordError":
          throw new BadRequestException(
            "The provided password has previously appeared in a data breach (https://haveibeenpwned.com/Passwords)"
          )

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }
  }

  public async deleteAccount(user: User, id: string): Promise<void> {
    // Run get accountdetails to make sure account exists and user has permission, we don't do anything with it because it will throw an exception if needed
    await this.getAccountDetails(user, id)

    // Response can be anything, ignore eslint rule
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .delete(`${wildDuckApiUrl}/users/${id}`, {
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
        case "UserNotFound":
          throw new NotFoundException(`No account found with id: ${id}`)

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }
  }
}
