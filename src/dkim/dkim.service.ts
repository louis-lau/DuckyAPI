import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { AxiosError, AxiosResponse } from 'axios'
import { ConfigService } from 'src/config/config.service'
import { DomainsService } from 'src/domains/domains.service'
import { User } from 'src/users/user.entity'

import { DkimKey } from './class/dkim-key.class'
import { AddDkimDto } from './dto/add-dkim.dto'

@Injectable()
export class DkimService {
  private readonly logger = new Logger(DkimService.name)

  public constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly domainsService: DomainsService,
  ) {}

  public async resolveDkimId(domain: string): Promise<string> {
    let ApiResponse: AxiosResponse<any>
    try {
      ApiResponse = await this.httpService.get(`/dkim/resolve/${domain}`).toPromise()
    } catch (error) {
      if (error instanceof AxiosError && (error.response.data.error || !error.response.data.success)) {
        switch (error.response.data.code) {
          case 'DkimNotFound':
            throw new NotFoundException(`No DKIM key found for domain: ${domain}`, 'DkimNotFoundError')

          default:
            this.logger.error(error.response.data)
            throw new InternalServerErrorException('Unknown error')
        }
      }
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    return ApiResponse.data.id
  }

  public async deleteDkim(user: User, domain: string): Promise<void> {
    await this.domainsService.checkIfDomainIsAddedToUser(user, domain, true)

    const dkimId = await this.resolveDkimId(domain)

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService.delete(`/dkim/${dkimId}`).toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case 'DkimNotFound':
          throw new NotFoundException(`No DKIM key found for domain: ${domain}`, 'DkimNotFoundError')

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException('Unknown error')
      }
    }
  }

  public async getDKIM(user: User, domain: string): Promise<DkimKey> {
    await this.domainsService.checkIfDomainIsAddedToUser(user, domain, true)

    const dkimId = await this.resolveDkimId(domain)

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService.get(`/dkim/${dkimId}`).toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case 'DkimNotFound':
          throw new NotFoundException(`No DKIM key found for domain: ${domain}`, 'DkimNotFoundError')

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException('Unknown error')
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
        value: apiResponse.data.dnsTxt.value,
      },
      created: apiResponse.data.created,
    }
  }

  public async updateDkim(user: User, addDkimDto: AddDkimDto, domain: string): Promise<DkimKey> {
    await this.domainsService.checkIfDomainIsAddedToUser(user, domain, true)

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .post(`/dkim`, {
          domain: domain,
          selector: addDkimDto.selector,
          privateKey: addDkimDto.privateKey,
        })
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case 'DkimNotFound':
          throw new NotFoundException(`No DKIM key found for domain: ${domain}`, 'DkimNotFoundError')

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException('Unknown error')
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
        value: apiResponse.data.dnsTxt.value,
      },
      created: apiResponse.data.created,
    }
  }
}
