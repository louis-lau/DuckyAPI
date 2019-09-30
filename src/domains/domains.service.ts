import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { Queue } from "bull"
import { InjectQueue } from "nest-bull"
import { AccountsService } from "src/accounts/accounts.service"
import { DkimKey } from "src/dkim/class/dkim-key.class"
import { DkimService } from "src/dkim/dkim.service"
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
    private readonly dkimService: DkimService,
    @InjectQueue("tasks") readonly taskQueue: Queue
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

    try {
      await this.dkimService.deleteDkim(user, domain)
    } catch (error) {
      // Don't throw error if no DKIM key is found
      if (error.response.error !== "DkimNotFoundError") {
        throw error
      }
    }

    this.taskQueue.add(
      "deleteAccounts",
      {
        user: user,
        domain: domain
      },
      {
        attempts: 5,
        backoff: {
          delay: 6000,
          type: "exponential"
        }
      }
    )

    this.taskQueue.add(
      "deleteForwarders",
      {
        user: user,
        domain: domain
      },
      {
        attempts: 5,
        backoff: {
          delay: 6000,
          type: "exponential"
        }
      }
    )

    await this.usersService.pullDomain(user._id, domain)
  }
}
