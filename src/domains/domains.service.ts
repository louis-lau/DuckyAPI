import { InjectQueue } from '@nestjs/bull'
import {
  BadRequestException,
  forwardRef,
  HttpService,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { AxiosResponse } from 'axios'
import { Queue } from 'bull'
import { MxRecord, promises as dns } from 'dns'
import { ConfigService } from 'src/config/config.service'
import { DkimKey } from 'src/dkim/class/dkim-key.class'
import { DkimService } from 'src/dkim/dkim.service'
import { DeleteForDomainData } from 'src/tasks/delete-for-domain/delete-for-domain.interfaces'
import { User } from 'src/users/user.entity'
import { UsersService } from 'src/users/users.service'

import { DnsCheck } from './class/dns.class'
import { Domain } from './domain.entity'

@Injectable()
export class DomainsService {
  private readonly logger = new Logger(DomainsService.name, true)

  public constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => DkimService))
    private readonly dkimService: DkimService,
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
    @InjectQueue('deleteForDomain')
    readonly deleteForDomainQueue: Queue<DeleteForDomainData>,
  ) {}

  public async getDomains(user: User): Promise<Domain[]> {
    const domains = user.domains

    if (domains.length === 0) {
      return []
    }

    const dkimKeyPromises: Promise<DkimKey | void>[] = []
    for (const [domainIndex, domain] of domains.entries()) {
      dkimKeyPromises.push(
        this.dkimService
          .resolveDkimId(domain.domain)
          .catch((error): void => {
            // Don't throw error if no DKIM key is found
            if (error.response.error !== 'DkimNotFoundError') {
              throw error
            }
          })
          .then((dkimId): void => {
            if (dkimId) {
              // DKIM key exists for this domain
              domains[domainIndex].dkim = true
            } else {
              domains[domainIndex].dkim = false
            }
          }),
      )
      if (domain.aliases) {
        for (const [aliasIndex, alias] of domain.aliases.entries()) {
          dkimKeyPromises.push(
            this.dkimService
              .resolveDkimId(alias.domain)
              .catch((error): void => {
                // Don't throw error if no DKIM key is found
                if (error.response.error !== 'DkimNotFoundError') {
                  throw error
                }
              })
              .then((dkimId): void => {
                if (dkimId) {
                  // DKIM key exists for this domain
                  domains[domainIndex].aliases[aliasIndex].dkim = true
                } else {
                  domains[domainIndex].aliases[aliasIndex].dkim = false
                }
              }),
          )
        }
      }
    }
    await Promise.all(dkimKeyPromises)

    return domains
  }

  public async checkDns(user: User, domain: string): Promise<DnsCheck> {
    await this.checkIfDomainIsAddedToUser(user, domain, true)

    const dnsCheck: DnsCheck = {
      correctValues: {
        mx: this.config.MX_RECORDS,
        spf: this.config.SPF_CORRECT_VALUE,
        dkim: undefined,
      },
      currentValues: {
        mx: undefined,
        spf: undefined,
        dkim: undefined,
      },
      errors: [],
      warnings: [],
    }

    const dkimKey = await this.dkimService.getDKIM(user, domain).catch((error): void => {
      // Don't throw error if no DKIM key is found
      if (error.response.error !== 'DkimNotFoundError') {
        throw error
      }
    })

    if (dkimKey) {
      dnsCheck.correctValues.dkim = {
        selector: dkimKey.selector,
        value: dkimKey.dnsTxt.value,
      }
    }

    const nsRecords = await dns.resolveNs(domain).catch((error): string[] => {
      switch (error.code) {
        case 'ENODATA':
        case 'ENOTFOUND':
          return []

        default:
          throw error
      }
    })

    if (nsRecords.length === 0) {
      dnsCheck.errors.push({
        type: 'ns',
        error: 'NsNotFound',
        message: `No nameservers found for ${domain}. You need them for your domain to work.`,
      })
      return dnsCheck
    }

    const dnsCheckPromises: Promise<any>[] = []

    if (dkimKey) {
      dnsCheckPromises.push(
        dns
          .resolveTxt(`${dkimKey.selector}._domainkey.${domain}`)
          .catch((error): string[][] => {
            switch (error.code) {
              case 'ENODATA':
              case 'ENOTFOUND':
                return [[]]

              default:
                throw error
            }
          })
          .then(
            async (txtRecords): Promise<void> => {
              // Combine chunked txt records. e.g. [["v=spf1 ip4:0.0.0.0 ", "~all"]] to ["v=spf1 ip4:0.0.0.0 ~all"]
              const combinedTxtRecords = txtRecords.map((item): string => item.join(''))

              // Only keep txt records that include v=DKIM1
              const dkimTxtRecords = combinedTxtRecords.filter((value): boolean => value.includes('v=DKIM1'))

              dnsCheck.currentValues.dkim = {
                selector: dkimKey.selector,
                value: dkimTxtRecords.join(),
              }

              if (dkimTxtRecords.length === 0) {
                dnsCheck.errors.push({
                  type: 'dkim',
                  error: 'DkimNotFound',
                  message: `DKIM signing is enabled on the server, but no DKIM record is configured on ${dkimKey.selector}._domainkey.${domain}.`,
                })
                return
              }

              if (dkimTxtRecords.length > 1) {
                dnsCheck.errors.push({
                  type: 'dkim',
                  error: 'DkimMultipleFound',
                  message:
                    'Multiple DKIM records found for this domain and selector, only one is allowed. The rest of the checks will be done on the first record.',
                })
              }

              if (dkimTxtRecords[0] !== dkimKey.dnsTxt.value) {
                dnsCheck.errors.push({
                  type: 'dkim',
                  error: 'DkimInvalid',
                  message: 'The DKIM record does not match the one above. Check for differences.',
                })
              }
            },
          ),
      )
    }

    dnsCheckPromises.push(
      dns
        .resolveMx(domain)
        .catch((error): MxRecord[] => {
          switch (error.code) {
            case 'ENODATA':
            case 'ENOTFOUND':
              return []

            default:
              throw error
          }
        })
        .then((mxRecords): void => {
          dnsCheck.currentValues.mx = mxRecords

          if (mxRecords.length === 0) {
            dnsCheck.errors.push({
              type: 'mx',
              error: 'MxNotFound',
              message: 'No MX record(s) found for this domain. You need these to receive email.',
            })
            return
          }

          for (const correctMxRecord of this.config.MX_RECORDS) {
            // if mxRecords doesn't include this correct mx record
            if (!mxRecords.some((mxRecord): boolean => mxRecord.exchange === correctMxRecord.exchange)) {
              dnsCheck.errors.push({
                type: 'mx',
                error: 'MxNotFound',
                message: `${correctMxRecord.exchange} was not found in the current MX records. Valid MX records are needed to receive email.`,
              })
            }
          }
        }),
    )

    dnsCheckPromises.push(
      dns
        .resolveTxt(domain)
        .catch((error): string[][] => {
          switch (error.code) {
            case 'ENODATA':
            case 'ENOTFOUND':
              return [[]]

            default:
              throw error
          }
        })
        .then(
          async (txtRecords): Promise<void> => {
            // Combine chunked txt records. e.g. [["v=spf1 ip4:0.0.0.0 ", "~all"]] to ["v=spf1 ip4:0.0.0.0 ~all"]
            const combinedTxtRecords = txtRecords.map((item): string => item.join(''))

            // Only keep txt records that include v=spf1
            const spfTxtRecords = combinedTxtRecords.filter((value): boolean => value.includes('v=spf1'))

            dnsCheck.currentValues.spf = spfTxtRecords.join()

            if (spfTxtRecords.length === 0) {
              dnsCheck.errors.push({
                type: 'spf',
                error: 'SpfNotFound',
                message: 'No SPF record found for this domain. You need this to send email.',
              })
              return
            }

            if (spfTxtRecords.length > 1) {
              dnsCheck.errors.push({
                type: 'spf',
                error: 'SpfMultipleFound',
                message:
                  'Multiple SPF records found for this domain, only one is allowed. The rest of the checks will be done on the first record.',
              })
            }

            if (this.config.SPF_REGEX && new RegExp(this.config.SPF_REGEX).test(spfTxtRecords[0])) {
              dnsCheck.errors.push({
                type: 'spf',
                error: 'SpfInvalid',
                message: `The SPF record is invalid. You need a valid SPF record to send email.`,
              })
            }
          },
        ),
    )

    await Promise.all(dnsCheckPromises)
    return dnsCheck
  }

  public async checkIfDomainAlreadyExists(user: User, domain: string): Promise<void> {
    if (user.domains.some((userdomain): boolean => userdomain.domain === domain)) {
      throw new BadRequestException(`Domain: ${domain} is already added to your account`, 'DomainExistsError')
    }
    if (
      user.domains.some(
        (userdomain): boolean => userdomain.aliases && userdomain.aliases.some((alias) => alias.domain === domain),
      )
    ) {
      throw new BadRequestException(
        `Domain: ${domain} is already added to your account as an alias`,
        'DomainExistsError',
      )
    }
    if ((await this.usersService.countByDomain(domain)) > 0) {
      throw new BadRequestException(`Domain: ${domain} is already claimed by another user`, 'DomainClaimedError')
    }
  }

  public async checkIfDomainIsAddedToUser(user: User, domain: string, includeAliases = false): Promise<void> {
    if (!user.domains.some((userDomain): boolean => userDomain.domain === domain)) {
      if (
        !includeAliases ||
        !user.domains.some(
          (userdomain): boolean => userdomain.aliases && userdomain.aliases.some((alias) => alias.domain === domain),
        )
      ) {
        throw new NotFoundException(`Domain: ${domain} doesn't exist in your account`, 'DomainNotFoundError')
      }
    }
  }

  public async addDomain(user: User, domain: string): Promise<void> {
    await this.checkIfDomainAlreadyExists(user, domain)
    await this.usersService.pushDomain(user._id, { domain: domain, admin: true })
  }

  public async deleteDomain(user: User, domain: string): Promise<void> {
    await this.checkIfDomainIsAddedToUser(user, domain)

    try {
      await this.dkimService.deleteDkim(user, domain)
    } catch (error) {
      // Don't throw error if no DKIM key is found
      if (error.response.error !== 'DkimNotFoundError') {
        throw error
      }
    }

    await this.deleteForDomainQueue.add('deleteAccounts', {
      user: user,
      domain: domain,
    })

    await this.deleteForDomainQueue.add('deleteForwarders', {
      user: user,
      domain: domain,
    })

    await this.deleteForDomainQueue.add('deleteAliases', {
      user: user,
      domain: domain,
    })

    await this.usersService.pullDomain(user._id, domain)
  }

  public async deleteAllDomains(user: User): Promise<void> {
    for (const domain of user.domains) {
      this.deleteDomain(user, domain.domain)
    }
  }

  public async addAlias(user: User, domain: string, alias: string): Promise<void> {
    await this.checkIfDomainIsAddedToUser(user, domain)
    await this.checkIfDomainAlreadyExists(user, alias)
    let apiResponse: AxiosResponse<any>
    try {
      apiResponse = await this.httpService
        .post(`/domainaliases`, {
          domain: domain,
          alias: alias,
        })
        .toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }
    if (apiResponse.data.error || !apiResponse.data.success) {
      switch (apiResponse.data.code) {
        case 'AliasExists':
          throw new BadRequestException(`Alias already exists`, 'AliasExistsError')

        default:
          this.logger.error(apiResponse.data)
          throw new InternalServerErrorException('Unknown error')
      }
    }
    this.usersService.pushAlias(user._id, domain, { domain: alias })
  }

  public async deleteAlias(user: User, domain: string, alias: string): Promise<void> {
    await this.checkIfDomainIsAddedToUser(user, domain)
    await this.checkIfDomainIsAddedToUser(user, alias, true)

    let resolveResponse: AxiosResponse<any>
    try {
      resolveResponse = await this.httpService.get(`/domainaliases/resolve/${alias}`).toPromise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
    }

    let aliasExists = true

    if (resolveResponse.data.error || !resolveResponse.data.success) {
      switch (resolveResponse.data.code) {
        case 'AliasNotFound':
          aliasExists = false

        default:
          this.logger.error(resolveResponse.data)
          throw new InternalServerErrorException('Unknown error')
      }
    }

    if (aliasExists) {
      let deleteResponse: AxiosResponse<any>
      try {
        deleteResponse = await this.httpService.delete(`/domainaliases/${resolveResponse.data.id}`).toPromise()
      } catch (error) {
        this.logger.error(error.message)
        throw new InternalServerErrorException('Backend service not reachable', 'WildduckApiError')
      }
      if (deleteResponse.data.error || !deleteResponse.data.success) {
        switch (deleteResponse.data.code) {
          default:
            this.logger.error(deleteResponse.data)
            throw new InternalServerErrorException('Unknown error')
        }
      }
    }

    try {
      await this.dkimService.deleteDkim(user, alias)
    } catch (error) {
      // Don't throw error if no DKIM key is found
      if (error.response.error !== 'DkimNotFoundError') {
        throw error
      }
    }

    this.usersService.pullAlias(user._id, alias)
  }
}
