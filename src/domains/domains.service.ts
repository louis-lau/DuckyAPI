import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { AccountsService } from "src/accounts/accounts.service"
import { Account } from "src/accounts/class/account.class"
import { User } from "src/users/user.class"
import { UsersService } from "src/users/users.service"

import { Domain } from "./domain.class"

@Injectable()
export class DomainsService {
  public constructor(private readonly usersService: UsersService, private readonly accountsService: AccountsService) {}

  public async getDomains(user: User): Promise<Domain[]> {
    if (user.domains.length === 0) {
      throw new NotFoundException(`No domains found for user: ${user.username}`)
    }

    return user.domains
  }

  public async addDomain(user: User, domain: string): Promise<void> {
    if (user.domains.some((userdomain): boolean => userdomain.domain === domain)) {
      throw new BadRequestException(`Domain: ${domain} already added for user: ${user.username}`)
    }
    const usersWithDomain = await this.usersService.findByDomain(domain)
    if (usersWithDomain.length > 0) {
      throw new BadRequestException(`Domain: ${domain} already claimed by another user`)
    }

    const updatedUser = await this.usersService.pushDomain(user._id, { domain: domain, admin: true })
    if (!updatedUser) {
      throw new InternalServerErrorException(`Failed to add domain`)
    }
  }

  public async deleteDomain(user: User, domain: string): Promise<void> {
    if (!user.domains.some((userDomain): boolean => userDomain.domain === domain)) {
      throw new BadRequestException(`Domain: ${domain} doesn't exist on user: ${user.username}`)
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
      for (const account of accounts) {
        await this.accountsService.deleteAccount(user, account.id)
      }
    }

    // this.usersService.pullDomain(user._id, domain)
  }
}
