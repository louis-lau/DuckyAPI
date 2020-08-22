import { OnQueueActive, OnQueueCompleted, OnQueueError, OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'
import { AccountsService } from 'src/accounts/accounts.service'
import { AccountListItem } from 'src/accounts/class/account-list-item.class'
import { Forwarder } from 'src/forwarders/class/forwarder.class'
import { ForwardersService } from 'src/forwarders/forwarders.service'

import { SuspensionData } from './suspension.interfaces'

@Processor('suspension')
export class SuspensionProcessor {
  public constructor(
    private readonly accountsService: AccountsService,
    private readonly forwardersService: ForwardersService,
  ) {}

  private readonly logger = new Logger(SuspensionProcessor.name, true)

  @Process({ name: 'suspendAccounts' })
  private async processSuspendAccounts(job: Job<SuspensionData>): Promise<void> {
    let accounts: AccountListItem[] = []
    try {
      accounts = await this.accountsService.getAccounts(job.data.user)
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
        promises.push(this.accountsService.suspend(account.id, true))
      }
      await Promise.all(promises)
    }
    job.progress(100)
  }

  @Process({ name: 'unsuspendAccounts' })
  private async processUnsuspendAccounts(job: Job<SuspensionData>): Promise<void> {
    let accounts: AccountListItem[] = []
    try {
      accounts = await this.accountsService.getAccounts(job.data.user)
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
        promises.push(this.accountsService.suspend(account.id, false))
      }
      await Promise.all(promises)
    }
    job.progress(100)
  }

  @Process({ name: 'suspendForwarders' })
  private async processSuspendForwarders(job: Job<SuspensionData>): Promise<void> {
    let forwarders: Forwarder[] = []
    try {
      forwarders = await this.forwardersService.getForwarders(job.data.user)
    } catch (error) {
      // Don't throw error if no accounts were found
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
        promises.push(this.forwardersService.disable(forwarder.id, true))
      }
      await Promise.all(promises)
    }
    job.progress(100)
  }
  @Process({ name: 'unsuspendForwarders' })
  private async processUnsuspendForwarders(job: Job<SuspensionData>): Promise<void> {
    let forwarders: Forwarder[] = []
    try {
      forwarders = await this.forwardersService.getForwarders(job.data.user)
    } catch (error) {
      // Don't throw error if no accounts were found
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
        promises.push(this.forwardersService.disable(forwarder.id, false))
      }
      await Promise.all(promises)
    }
    job.progress(100)
  }

  @OnQueueActive()
  private onActive(job: Job<SuspensionData>): void {
    this.logger.log(`Processing job ${job.id} (${job.name}) for user ${job.data.user._id.toHexString()}`)
  }

  @OnQueueCompleted()
  private onCompleted(job: Job<SuspensionData>): void {
    this.logger.log(`Completed job ${job.id} (${job.name}) successfully`)
  }

  @OnQueueError()
  private onError(job: Job<SuspensionData>): void {
    this.logger.error(`Error for job ${job.id} (${job.name}): ${job.stacktrace}`)
  }

  @OnQueueFailed()
  private onFailed(job: Job<SuspensionData>): void {
    this.logger.error(`Job ${job.id} (${job.name}) failed!: ${job.stacktrace}`)
  }
}
