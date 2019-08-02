import {
  Injectable,
  HttpService,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  BadRequestException
} from "@nestjs/common"
import { wildDuckApiUrl, wildDuckApiToken, allowUnsafePasswords } from "src/constants"
import { Account } from "./account.class"
import { AxiosResponse } from "axios"
import { CreateAccountDto } from "./create-account.dto"

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

    if (apiResponse.data.error) {
      let message: string
      let userSideError: boolean
      let log: boolean
      switch (apiResponse.data.code || !apiResponse.data.success) {
        case "AddressExistsError":
          message = "This account already exists"
          userSideError = true
          break

        case "InsecurePasswordError":
          message =
            "The provided password has previously appeared in a data breach (https://haveibeenpwned.com/Passwords)"
          userSideError = true
          break

        default:
          message = "Unknown error"
          log = true
          break
      }

      if (log) {
        this.logger.error(apiResponse.data)
      }

      if (userSideError) {
        throw new BadRequestException(message)
      } else {
        throw new InternalServerErrorException(message)
      }
    }
  }
}
