import { Test, TestingModule } from "@nestjs/testing"
import { AccountsController } from "./accounts.controller"

describe("Accounts Controller", (): void => {
  let controller: AccountsController

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AccountsController]
      }).compile()

      controller = module.get<AccountsController>(AccountsController)
    }
  )

  it("should be defined", (): void => {
    expect(controller).toBeDefined()
  })
})
