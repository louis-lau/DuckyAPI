import { Test, TestingModule } from "@nestjs/testing"

import { DkimController } from "./dkim.controller"

describe("Dkim Controller", (): void => {
  let controller: DkimController

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [DkimController]
      }).compile()

      controller = module.get<DkimController>(DkimController)
    }
  )

  it("should be defined", (): void => {
    expect(controller).toBeDefined()
  })
})
