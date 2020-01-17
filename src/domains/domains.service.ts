import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { Queue } from 'bull'
import { MxRecord, promises as dns } from 'dns'
import { InjectQueue } from 'nest-bull'
import { AccountsService } from 'src/accounts/accounts.service'
import { DnsConfig } from 'src/constants'
import { DkimKey } from 'src/dkim/class/dkim-key.class'
import { DkimService } from 'src/dkim/dkim.service'
import { ForwardersService } from 'src/forwarders/forwarders.service'
import { User } from 'src/users/user.entity'
import { UsersService } from 'src/users/users.service'

import { DnsCheck } from './class/dns.class'
import { Domain } from './domain.entity'

@Injectable()
export class DomainsService {
  public constructor(
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly forwardersService: ForwardersService,
    private readonly dkimService: DkimService,
    @InjectQueue('tasks') readonly taskQueue: Queue,
  ) {}

  public async getDomains(user: User): Promise<Domain[]> {
    const domains = user.domains

    if (domains.length === 0) {
      throw new NotFoundException(`No domains found for user: ${user.username}`, 'DomainNotFoundError')
    }

    const dkimKeyPromises: Promise<DkimKey | void>[] = []
    for (const [i, domain] of domains.entries()) {
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
              domains[i].dkim = true
            } else {
              domains[i].dkim = false
            }
          }),
      )
    }
    await Promise.all(dkimKeyPromises)

    return domains
  }

  public async checkDns(user: User, domain: string): Promise<DnsCheck> {
    if (!user.domains.some((userDomain): boolean => userDomain.domain === domain)) {
      throw new NotFoundException(`Domain: ${domain} doesn't exist on user: ${user.username}`, 'DomainNotFoundError')
    }

    const dnsCheck: DnsCheck = {
      correctValues: {
        mx: DnsConfig.mx.records,
        spf: DnsConfig.spf.correctValue,
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

          for (const correctMxRecord of DnsConfig.mx.records) {
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

            if (!DnsConfig.spf.regex.test(spfTxtRecords[0])) {
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

  public async addDomain(user: User, domain: string): Promise<void> {
    if (user.domains.some((userdomain): boolean => userdomain.domain === domain)) {
      throw new BadRequestException(`Domain: ${domain} already added for user: ${user.username}`, 'DomainExistsError')
    }
    const usersWithDomain = await this.usersService.findByDomain(domain)
    if (usersWithDomain.length > 0) {
      throw new BadRequestException(`Domain: ${domain} already claimed by another user`, 'DomainClaimedError')
    }
    await this.usersService.pushDomain(user._id, { domain: domain, admin: true })
  }

  public async deleteDomain(user: User, domain: string): Promise<void> {
    if (!user.domains.some((userDomain): boolean => userDomain.domain === domain)) {
      throw new NotFoundException(`Domain: ${domain} doesn't exist on user: ${user.username}`, 'DomainNotFoundError')
    }

    try {
      await this.dkimService.deleteDkim(user, domain)
    } catch (error) {
      // Don't throw error if no DKIM key is found
      if (error.response.error !== 'DkimNotFoundError') {
        throw error
      }
    }

    await this.taskQueue.add(
      'deleteAccounts',
      {
        user: user,
        domain: domain,
      },
      {
        attempts: 5,
        backoff: {
          delay: 6000,
          type: 'exponential',
        },
      },
    )

    await this.taskQueue.add(
      'deleteForwarders',
      {
        user: user,
        domain: domain,
      },
      {
        attempts: 5,
        backoff: {
          delay: 6000,
          type: 'exponential',
        },
      },
    )

    await this.usersService.pullDomain(user._id, domain)
  }
}
