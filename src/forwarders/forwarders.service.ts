import {
  BadRequestException,
  HttpService,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common"
import { AxiosResponse } from "axios"
import { allowForwarderWildcard, maxLimits, wildDuckApiToken, wildDuckApiUrl } from "src/constants"
import { User } from "src/users/class/user.class"

import { ForwarderDetails } from "./class/forwarder-details.class"
import { Forwarder } from "./class/forwarder.class"
import { CreateForwarderDto } from "./dto/create-forwarder.dto"
import { UpdateForwarderDto } from "./dto/update-forwarder.dto"

@Injectable()
export class ForwardersService {
  private readonly logger = new Logger(ForwardersService.name, true)

  public constructor(private readonly httpService: HttpService) {}

  public async getForwarders(user: User, domain?: string): Promise<Forwarder[]> {
    if (user.domains.length === 0) {
      throw new NotFoundException(`No forwarders found for user: ${user.username}`, "ForwarderNotFoundError")
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
      // Comma delimited list of domains with "domain:" prefix to match the tags added to forwarders
      domainTags = user.domains.map((domain): string => `domain:${domain.domain}`).join()
    }

    let results: any[] = []
    let nextCursor: string | false

    while (true) {
      let apiResponse: AxiosResponse<any>
      try {
        apiResponse = await this.httpService
          .get(`${wildDuckApiUrl}/addresses`, {
            headers: {
              "X-Access-Token": wildDuckApiToken
            },
            params: {
              tags: domainTags,
              requiredTags: "forwarder",
              limit: 250,
              next: nextCursor
            }
          })
          .toPromise()
      } catch (error) {
        this.logger.error(error.message)
        throw new InternalServerErrorException("Backend service not reachable", "WildduckApiError")
      }
      if (apiResponse.data.results.length === 0) {
        throw new NotFoundException(`No forwarders found for user: ${user.username}`, "ForwarderNotFoundError")
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

    const forwarders: Forwarder[] = []
    for (const result of results) {
      forwarders.push({
        id: result.id,
        address: result.address
      })
    }
    return forwarders
  }

  public async getForwarderDetails(user: User, forwarderId: string): Promise<ForwarderDetails> {
    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .get(`${wildDuckApiUrl}/addresses/forwarded/${forwarderId}`, {
          headers: {
            "X-Access-Token": wildDuckApiToken
          }
        })
        .toPromise()
    } catch (error) {
      if (error.response.data.error) {
        switch (error.response.data.code) {
          case "AddressNotFound":
            throw new NotFoundException(`No forwarder found with id: ${forwarderId}`, "ForwarderNotFoundError")

          default:
            this.logger.error(error.response.data)
            throw new InternalServerErrorException("Backend service not reachable", "WildduckApiError")
        }
      }
      this.logger.error(error.message)
      throw new InternalServerErrorException("Backend service not reachable", "WildduckApiError")
    }

    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }

    const addressDomain: string = apiResponse.data.address.substring(apiResponse.data.address.lastIndexOf("@") + 1)
    if (!user.domains.some((domain): boolean => domain.domain === addressDomain)) {
      // if address domain doesn't belong to user
      throw new NotFoundException(`No forwarder found with id: ${forwarderId}`, "ForwarderNotFoundError")
    }

    return {
      id: apiResponse.data.id,
      name: apiResponse.data.name,
      address: apiResponse.data.address,
      targets: apiResponse.data.targets,
      limits: {
        forward: {
          allowed: apiResponse.data.limits.forwards.allowed,
          used: apiResponse.data.limits.forwards.used,
          ttl: apiResponse.data.limits.forwards.ttl
        }
      }
    }
  }

  public async createForwarder(user: User, createForwarderDto: CreateForwarderDto): Promise<void> {
    const addressDomain = createForwarderDto.address.substring(createForwarderDto.address.lastIndexOf("@") + 1)
    if (!user.domains.some((domain): boolean => domain.domain === addressDomain)) {
      // if address domain doesn't belong to user
      throw new BadRequestException(
        `You don't have permission to add forwarders on ${addressDomain}. Add the domain first.`,
        "DomainNotFoundError"
      )
    }

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .post(
          `${wildDuckApiUrl}/addresses/forwarded`,
          {
            address: createForwarderDto.address,
            name: createForwarderDto.name,
            targets: createForwarderDto.targets,
            forwards: createForwarderDto.limits.forward || maxLimits.forward,
            allowWildcard: allowForwarderWildcard,
            tags: [`domain:${addressDomain}`, "forwarder"]
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
        case "AddressExists":
          throw new BadRequestException(`Address: ${createForwarderDto.address} already exists`, "AddressExistsError")

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }
  }

  public async updateForwarder(user: User, forwarderId: string, updateForwarderDto: UpdateForwarderDto): Promise<void> {
    let addressDomain
    if (updateForwarderDto.address) {
      addressDomain = updateForwarderDto.address.substring(updateForwarderDto.address.lastIndexOf("@") + 1)
      if (!user.domains.some((domain): boolean => domain.domain === addressDomain)) {
        // if address domain doesn't belong to user
        throw new BadRequestException(
          `You don't have permission to add forwarders on ${addressDomain}. Add the domain first.`,
          "DomainNotFoundError"
        )
      }
    }

    // Run get forwarderdetails to make sure forwarder exists and user has permission, we don't do anything with it because it will throw an exception if needed
    await this.getForwarderDetails(user, forwarderId)

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .put(
          `${wildDuckApiUrl}/addresses/forwarded/${forwarderId}`,
          {
            address: updateForwarderDto.address,
            name: updateForwarderDto.name,
            targets: updateForwarderDto.targets,
            forwards: updateForwarderDto.limits.forward,
            tags: addressDomain ? [`domain:${addressDomain}`, "forwarder"] : undefined
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
          throw new BadRequestException(`Address: ${updateForwarderDto.address} already exists`, "AddressExistsError")

        case "ChangeNotAllowed":
          throw new BadRequestException(
            `Update to address: ${updateForwarderDto.address} not allowed. Keep in mind wildcard addresses can not be changed`,
            "AddressChangeNotAllowedError"
          )

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }
  }

  public async deleteForwarder(user: User, forwarderId: string): Promise<void> {
    // Run get accountdetails to make sure account exists and user has permission, we don't do anything with it because it will throw an exception if needed
    await this.getForwarderDetails(user, forwarderId)

    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .delete(`${wildDuckApiUrl}/addresses/forwarded/${forwarderId}`, {
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
        case "AddressNotFound":
          throw new NotFoundException(`No forwarder found with id: ${forwarderId}`, "ForwarderNotFoundError")

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException("Unknown error")
      }
    }
  }
}
