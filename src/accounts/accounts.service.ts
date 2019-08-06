import {
  Injectable,
  HttpService,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  BadRequestException
} from "@nestjs/common"
import { wildDuckApiUrl, wildDuckApiToken, allowUnsafePasswords } from "src/constants"
import { Account } from "./class/account.class"
import { AxiosResponse } from "axios"
import { CreateAccountDto } from "./dto/create-account.dto"
import { AccountDetails } from "./class/account-details.class"
import { UpdateAccountDto } from "./dto/update-account.dto"

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

  public async getAccountDetails(id: string): Promise<AccountDetails> {
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
          throw new NotFoundException("No account found with this id")

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }

    let result = apiResponse.data
    this.logger.log(result)
    return {
      id: result.id,
      name: result.name,
      address: result.address,
      quotaAllowed: result.limits.quota.allowed,
      quotaUsed: result.limits.quota.used,
      disabled: result.disabled,
      spamLevel: result.spamLevel,
      disabledScopes: result.disabledScopes
    }
  }

  public async createAccount(createAccountDto: CreateAccountDto): Promise<void> {
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
            allowUnsafe: allowUnsafePasswords
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
          throw new BadRequestException("This account already exists")

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

  public async updateAccount(id: string, updateAccountDto: UpdateAccountDto): Promise<void> {
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
}
