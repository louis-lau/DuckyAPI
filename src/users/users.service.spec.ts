import { Test, TestingModule } from "@nestjs/testing"

import { UsersService } from "./users.service"

describe("UsersService", (): void => {
  let service: UsersService

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [UsersService]
      }).compile()

      service = module.get<UsersService>(UsersService)
    }
  )

  it("should be defined", (): void => {
    expect(service).toBeDefined()
  })
})
