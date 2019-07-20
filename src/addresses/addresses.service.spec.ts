import { Test, TestingModule } from "@nestjs/testing"
import { AddressesService } from "./addresses.service"

describe("AddressesService", (): void => {
  let service: AddressesService

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [AddressesService]
      }).compile()

      service = module.get<AddressesService>(AddressesService)
    }
  )

  it("should be defined", (): void => {
    expect(service).toBeDefined()
  })
})
