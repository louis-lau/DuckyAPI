import { OnQueueActive, OnQueueCompleted, OnQueueError, OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'
import { AccountsService } from 'src/accounts/accounts.service'
import { AccountListItem } from 'src/accounts/class/account-list-item.class'
import { DomainAlias } from 'src/domains/domain.entity'
import { DomainsService } from 'src/domains/domains.service'
import { Forwarder } from 'src/forwarders/class/forwarder.class'
import { ForwardersService } from 'src/forwarders/forwarders.service'

import { DeleteForDomainData } from './delete-for-domain.interfaces'

@Processor('deleteForDomain')
export class DeleteForDomainProcessor {
  public constructor(
    private readonly accountsService: AccountsService,
    private readonly forwardersService: ForwardersService,
    private readonly domainsService: DomainsService,
  ) {}

  private readonly logger = new Logger(DeleteForDomainProcessor.name, true)

  @Process({ name: 'deleteAccounts' })
  private async processDeleteAccounts(job: Job<DeleteForDomainData>): Promise<void> {
    let accounts: AccountListItem[] = []
    try {
      accounts = await this.accountsService.getAccounts(job.data.user, job.data.domain)
    } catch (error) {
      // Don't throw error if no accounts were found
      if (error.response.error === 'AccountNotFoundError') {
        return
      } else {
        throw error
      }
    }

    const accountChunks: AccountListItem[][] = []
    const chunkSize = 10
    for (let i = 0; i < accounts.length; i += chunkSize) {
      accountChunks.push(accounts.slice(i, i + chunkSize))
    }

    let promises: Promise<void>[] = []
    for (const [i, accountChunk] of accountChunks.entries()) {
      job.progress(Math.round((i / accountChunks.length) * 100))

      promises = []
      for (const account of accountChunk) {
        promises.push(this.accountsService.deleteAccount(job.data.user, account.id))
      }
      await Promise.all(promises)
    }
    job.progress(100)
  }

  @Process({ name: 'deleteForwarders' })
  private async processDeleteForwarders(job: Job<DeleteForDomainData>): Promise<void> {
    let forwarders: Forwarder[] = []
    try {
      forwarders = await this.forwardersService.getForwarders(job.data.user, job.data.domain)
    } catch (error) {
      // Don't throw error if no forwarders were found
      if (error.response.error === 'ForwarderNotFoundError') {
        return
      } else {
        throw error
      }
    }

    const forwarderChunks: Forwarder[][] = []
    const chunkSize = 10
    for (let i = 0; i < forwarders.length; i += chunkSize) {
      forwarderChunks.push(forwarders.slice(i, i + chunkSize))
    }

    let promises: Promise<void>[] = []
    for (const [i, forwarderChunk] of forwarderChunks.entries()) {
      job.progress(Math.round((i / forwarderChunks.length) * 100))

      promises = []
      for (const forwarder of forwarderChunk) {
        promises.push(this.forwardersService.deleteForwarder(job.data.user, forwarder.id))
      }
      await Promise.all(promises)
    }
    job.progress(100)
  }

  @Process({ name: 'deleteAliases' })
  private async processDeleteAliases(job: Job<DeleteForDomainData>): Promise<void> {
    const aliases = job.data.user.domains.find(domain => domain.domain === job.data.domain).aliases
    if (!aliases || aliases.length === 0) {
      return
    }

    const aliasChunks: DomainAlias[][] = []
    const chunkSize = 10
    for (let i = 0; i < aliases.length; i += chunkSize) {
      aliasChunks.push(aliases.slice(i, i + chunkSize))
    }

    let promises: Promise<void>[] = []
    for (const [i, aliasChunk] of aliasChunks.entries()) {
      job.progress(Math.round((i / aliasChunks.length) * 100))

      promises = []
      for (const alias of aliasChunk) {
        promises.push(this.domainsService.deleteAlias(job.data.user, job.data.domain, alias.domain))
      }
      await Promise.all(promises)
    }
    job.progress(100)
  }

  @OnQueueActive()
  private onActive(job: Job<DeleteForDomainData>): void {
    this.logger.log(
      `Processing job ${job.id} (${job.name}) for user ${job.data.user._id} and domain ${job.data.domain}`,
    )
  }

  @OnQueueCompleted()
  private onCompleted(job: Job<DeleteForDomainData>): void {
    this.logger.log(`Completed job ${job.id} (${job.name}) successfully`)
  }

  @OnQueueError()
  private onError(job: Job<DeleteForDomainData>): void {
    this.logger.error(`Error for job ${job.id} (${job.name}): ${job.stacktrace}`)
  }

  @OnQueueFailed()
  private onFailed(job: Job<DeleteForDomainData>): void {
    this.logger.error(`Job ${job.id} (${job.name}) failed!: ${job.stacktrace}`)
  }
}
