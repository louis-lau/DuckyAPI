import { Test, TestingModule } from "@nestjs/testing"
import { AppController } from "./app.controller"

describe("AppController", (): void => {
  let appController: AppController

  beforeEach(
    async (): Promise<void> => {
      const app: TestingModule = await Test.createTestingModule({
        controllers: [AppController]
      }).compile()

      appController = app.get<AppController>(AppController)
    }
  )
})
