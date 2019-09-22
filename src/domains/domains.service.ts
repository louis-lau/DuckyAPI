import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { AccountsService } from "src/accounts/accounts.service"
import { AccountListItem } from "src/accounts/class/account-list-item.class"
import { DkimKey } from "src/dkim/class/dkim-key.class"
import { DkimService } from "src/dkim/dkim.service"
import { Forwarder } from "src/forwarders/class/forwarder.class"
import { ForwardersService } from "src/forwarders/forwarders.service"
import { User } from "src/users/user.class"
import { UsersService } from "src/users/users.service"

import { Domain } from "./domain.class"

@Injectable()
export class DomainsService {
  public constructor(
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly forwardersService: ForwardersService,
    private readonly dkimService: DkimService
  ) {}

  public async getDomains(user: User): Promise<Domain[]> {
    const domains = user.domains

    if (domains.length === 0) {
      throw new NotFoundException(`No domains found for user: ${user.username}`, "DomainNotFoundError")
    }

    const dkimKeyPromises: Promise<DkimKey | void>[] = []
    for (const [i, domain] of domains.entries()) {
      dkimKeyPromises.push(
        this.dkimService
          .getDKIM(user, domain.domain)
          .catch((error): void => {
            // Don't throw error if no DKIM key is found
            if (error.response.error !== "DkimNotFoundError") {
              throw error
            }
          })
          .then((dkimKey): void => {
            if (dkimKey) {
              // DKIM key exists for this domain
              domains[i].dkim = true
            } else {
              domains[i].dkim = false
            }
          })
      )
    }
    await Promise.all(dkimKeyPromises)

    return domains
  }

  public async addDomain(user: User, domain: string): Promise<void> {
    if (user.domains.some((userdomain): boolean => userdomain.domain === domain)) {
      throw new BadRequestException(`Domain: ${domain} already added for user: ${user.username}`, "DomainExistsError")
    }
    const usersWithDomain = await this.usersService.findByDomain(domain)
    if (usersWithDomain.length > 0) {
      throw new BadRequestException(`Domain: ${domain} already claimed by another user`, "DomainClaimedError")
    }

    await this.usersService.pushDomain(user._id, { domain: domain })
  }

  public async deleteDomain(user: User, domain: string): Promise<void> {
    if (!user.domains.some((userDomain): boolean => userDomain.domain === domain)) {
      throw new NotFoundException(`Domain: ${domain} doesn't exist on user: ${user.username}`, "DomainNotFoundError")
    }

    let accounts: AccountListItem[] = []
    try {
      accounts = await this.accountsService.getAccounts(user, domain)
    } catch (error) {
      // Don't throw error if no accounts were found
      if (error.response.error !== "AccountNotFoundError") {
        throw error
      }
    }

    let forwarders: Forwarder[] = []
    try {
      forwarders = await this.forwardersService.getForwarders(user, domain)
    } catch (error) {
      if (error.response.error !== "ForwarderNotFoundError") {
        throw error
      }
    }

    const promises: Promise<void>[] = []
    if (accounts.length > 0) {
      for (const account of accounts) {
        promises.push(this.accountsService.deleteAccount(user, account.id))
      }
    }
    if (forwarders.length > 0) {
      for (const forwarder of forwarders) {
        promises.push(this.forwardersService.deleteForwarder(user, forwarder.id))
      }
    }
    promises.push(
      this.dkimService.deleteDkim(user, domain).catch((error): void => {
        // Don't throw error if no DKIM key is found
        if (error.response.error !== "DkimNotFoundError") {
          throw error
        }
      })
    )

    await Promise.all(promises)
    await this.usersService.pullDomain(user._id, domain)
  }
}
