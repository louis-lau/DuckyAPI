import { Test, TestingModule } from "@nestjs/testing"
import { AddressesController } from "./addresses.controller"

describe("Addresses Controller", (): void => {
  let controller: AddressesController

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AddressesController]
      }).compile()

      controller = module.get<AddressesController>(AddressesController)
    }
  )

  it("should be defined", (): void => {
    expect(controller).toBeDefined()
  })
})
