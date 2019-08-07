import { Test, TestingModule } from "@nestjs/testing"

import { UsersController } from "./users.controller"

describe("Users Controller", (): void => {
  let controller: UsersController

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [UsersController]
      }).compile()

      controller = module.get<UsersController>(UsersController)
    }
  )

  it("should be defined", (): void => {
    expect(controller).toBeDefined()
  })
})
