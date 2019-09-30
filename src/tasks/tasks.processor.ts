import { Logger } from "@nestjs/common"
import { Job } from "bull"
import { BullQueueEvents, OnQueueActive, OnQueueEvent, Process, Processor } from "nest-bull"
import { AccountsService } from "src/accounts/accounts.service"
import { AccountListItem } from "src/accounts/class/account-list-item.class"
import { Forwarder } from "src/forwarders/class/forwarder.class"
import { ForwardersService } from "src/forwarders/forwarders.service"

import { DeleteAccountsData } from "./tasks.interfaces"

@Processor({ name: "tasks" })
export class TasksProcessor {
  public constructor(
    private readonly accountsService: AccountsService,
    private readonly forwardersService: ForwardersService
  ) {}

  private readonly logger = new Logger(TasksProcessor.name, true)

  @Process({ name: "deleteAccounts" })
  private async processDeleteAccounts(job: Job<DeleteAccountsData>): Promise<void> {
    let accounts: AccountListItem[] = []
    try {
      accounts = await this.accountsService.getAccounts(job.data.user, job.data.domain)
    } catch (error) {
      // Don't throw error if no accounts were found
      if (error.response.error === "AccountNotFoundError") {
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

  @Process({ name: "deleteForwarders" })
  private async processDeleteForwarders(job: Job<DeleteAccountsData>): Promise<void> {
    let forwarders: Forwarder[] = []
    try {
      forwarders = await this.forwardersService.getForwarders(job.data.user, job.data.domain)
    } catch (error) {
      // Don't throw error if no forwarders were found
      if (error.response.error === "ForwarderNotFoundError") {
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

  @OnQueueActive()
  private onActive(job: Job): void {
    switch (job.name) {
      case "deleteAccounts":
        this.logger.log(
          `Processing job ${job.id} (${job.name}) for user ${job.data.user._id} and domain ${job.data.domain}`
        )
        break

      default:
        this.logger.log(`Processing job ${job.id} (${job.name})`)
        break
    }
  }

  @OnQueueEvent(BullQueueEvents.COMPLETED)
  private onCompleted(job: Job): void {
    this.logger.log(`Completed job ${job.id} (${job.name}) successfully`)
  }

  @OnQueueEvent(BullQueueEvents.ERROR)
  private onError(job: Job): void {
    this.logger.error(`Error for job ${job.id} (${job.name}): ${job.stacktrace}`)
  }

  @OnQueueEvent(BullQueueEvents.FAILED)
  private onFailed(job: Job): void {
    this.logger.error(`Job ${job.id} (${job.name}) failed!: ${job.stacktrace}`)
  }
}
