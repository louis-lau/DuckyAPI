import { Test, TestingModule } from "@nestjs/testing"

import { AuthController } from "./auth.controller"

describe("Auth Controller", (): void => {
  let controller: AuthController

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AuthController]
      }).compile()

      controller = module.get<AuthController>(AuthController)
    }
  )

  it("should be defined", (): void => {
    expect(controller).toBeDefined()
  })
})
