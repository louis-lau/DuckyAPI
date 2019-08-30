import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { AccountsService } from "src/accounts/accounts.service"
import { Account } from "src/accounts/class/account.class"
import { DkimService } from "src/dkim/dkim.service"
import { User } from "src/users/user.class"
import { UsersService } from "src/users/users.service"

import { Domain } from "./domain.class"

@Injectable()
export class DomainsService {
  public constructor(
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly dkimService: DkimService
  ) {}

  public async getDomains(user: User): Promise<Domain[]> {
    if (user.domains.length === 0) {
      throw new NotFoundException(`No domains found for user: ${user.username}`, "DomainNotFoundError")
    }

    return user.domains
  }

  public async addDomain(user: User, domain: string): Promise<void> {
    if (user.domains.some((userdomain): boolean => userdomain.domain === domain)) {
      throw new BadRequestException(`Domain: ${domain} already added for user: ${user.username}`, "DomainExistsError")
    }
    const usersWithDomain = await this.usersService.findByDomain(domain)
    if (usersWithDomain.length > 0) {
      throw new BadRequestException(`Domain: ${domain} already claimed by another user`, "DomainClaimedError")
    }

    await this.usersService.pushDomain(user._id, { domain: domain, admin: true })
  }

  public async deleteDomain(user: User, domain: string): Promise<void> {
    if (!user.domains.some((userDomain): boolean => userDomain.domain === domain)) {
      throw new NotFoundException(`Domain: ${domain} doesn't exist on user: ${user.username}`, "DomainNotFoundError")
    }

    let accounts: Account[] = []
    try {
      accounts = await this.accountsService.getAccounts(user, domain)
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        // Don't throw error if no accounts were found
        throw error
      }
    }

    if (accounts.length > 0) {
      const promises = []
      for (const account of accounts) {
        promises.push(this.accountsService.deleteAccount(user, account.id))
      }
      await Promise.all(promises)
    }
    this.dkimService.deleteDkim(user, domain)
    this.usersService.pullDomain(user._id, domain)
  }
}
