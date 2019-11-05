import { HttpService, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common"
import { AxiosResponse } from "axios"
import { wildDuckApiToken, wildDuckApiUrl } from "src/constants"
import { User } from "src/users/class/user.class"

import { DkimKey } from "./class/dkim-key.class"
import { AddDkimDto } from "./dto/add-dkim.dto"

@Injectable()
export class DkimService {
  private readonly logger = new Logger(DkimService.name, true)

  public constructor(private readonly httpService: HttpService) {}

  public async resolveDkimId(domain: string): Promise<string> {
    let ApiResponse: AxiosResponse<any>
    try {
      ApiResponse = await this.httpService
        .get(`${wildDuckApiUrl}/dkim/resolve/${domain}`, {
          headers: {
            "X-Access-Token": wildDuckApiToken
          }
        })
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException("Backend service not reachable", "WildduckApiError")
    }

    if (ApiResponse.data.error || !ApiResponse.data.success) {
      switch (ApiResponse.data.code) {
        case "DkimNotFound":
          throw new NotFoundException(`No DKIM key found for domain: ${domain}`, "DkimNotFoundError")

        default:
          this.logger.error(ApiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }

    return ApiResponse.data.id
  }

  public async deleteDkim(user: User, domain: string): Promise<void> {
    if (!user.domains.some((userDomain): boolean => userDomain.domain === domain)) {
      throw new NotFoundException(`Domain: ${domain} doesn't exist on user: ${user.username}`, "DomainNotFoundError")
    }

    const dkimId = await this.resolveDkimId(domain)

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .delete(`${wildDuckApiUrl}/dkim/${dkimId}`, {
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
        case "DkimNotFound":
          throw new NotFoundException(`No DKIM key found for domain: ${domain}`, "DkimNotFoundError")

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }
  }

  public async getDKIM(user: User, domain: string): Promise<DkimKey> {
    if (!user.domains.some((userDomain): boolean => userDomain.domain === domain)) {
      throw new NotFoundException(`Domain: ${domain} doesn't exist on user: ${user.username}`, "DomainNotFoundError")
    }

    const dkimId = await this.resolveDkimId(domain)

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .get(`${wildDuckApiUrl}/dkim/${dkimId}`, {
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
        case "DkimNotFound":
          throw new NotFoundException(`No DKIM key found for domain: ${domain}`, "DkimNotFoundError")

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }

    return {
      id: apiResponse.data.id,
      domain: apiResponse.data.domain,
      selector: apiResponse.data.selector,
      fingerprint: apiResponse.data.fingerprint,
      publicKey: apiResponse.data.publicKey,
      dnsTxt: {
        name: apiResponse.data.dnsTxt.name,
        value: apiResponse.data.dnsTxt.value
      },
      created: apiResponse.data.created
    }
  }

  public async updateDkim(user: User, addDkimDto: AddDkimDto, domain: string): Promise<DkimKey> {
    if (!user.domains.some((userDomain): boolean => userDomain.domain === domain)) {
      throw new NotFoundException(`Domain: ${domain} doesn't exist on user: ${user.username}`, "DomainNotFoundError")
    }

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .post(
          `${wildDuckApiUrl}/dkim`,
          {
            domain: domain,
            selector: addDkimDto.selector,
            privateKey: addDkimDto.privateKey
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
        case "DkimNotFound":
          throw new NotFoundException(`No DKIM key found for domain: ${domain}`, "DkimNotFoundError")

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }

    return {
      id: apiResponse.data.id,
      domain: apiResponse.data.domain,
      selector: apiResponse.data.selector,
      fingerprint: apiResponse.data.fingerprint,
      publicKey: apiResponse.data.publicKey,
      dnsTxt: {
        name: apiResponse.data.dnsTxt.name,
        value: apiResponse.data.dnsTxt.value
      },
      created: apiResponse.data.created
    }
  }
}
