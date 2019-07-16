import { Test, TestingModule } from "@nestjs/testing"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"

describe("AppController", (): void => {
  let appController: AppController

  beforeEach(
    async (): Promise<void> => {
      const app: TestingModule = await Test.createTestingModule({
        controllers: [AppController],
        providers: [AppService]
      }).compile()

      appController = app.get<AppController>(AppController)
    }
  )

  describe("root", (): void => {
    it('should return "Hello World!"', (): void => {
      expect(appController.getHello()).toBe("Hello World!")
    })
  })
})
