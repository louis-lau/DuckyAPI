import { Test, TestingModule } from "@nestjs/testing"
import { AccountsService } from "./accounts.service"

describe("AccountsService", (): void => {
  let service: AccountsService

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [AccountsService]
      }).compile()

      service = module.get<AccountsService>(AccountsService)
    }
  )

  it("should be defined", (): void => {
    expect(service).toBeDefined()
  })
})
