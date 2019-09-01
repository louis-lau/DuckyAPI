import { Test, TestingModule } from "@nestjs/testing"

import { ForwardersService } from "./forwarders.service"

describe("ForwardersService", (): void => {
  let service: ForwardersService

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [ForwardersService]
      }).compile()

      service = module.get<ForwardersService>(ForwardersService)
    }
  )

  it("should be defined", (): void => {
    expect(service).toBeDefined()
  })
})
