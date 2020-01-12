import { Test, TestingModule } from "@nestjs/testing"
import { AppModule } from "src/app.module"
import Request from "supertest"

describe("AppController (e2e)", (): void => {
  let app

  beforeEach(
    async (): Promise<void> => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule]
      }).compile()

      app = moduleFixture.createNestApplication()
      await app.init()
    }
  )

  it("/ (GET)", (): Request.Test => {
    return Request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect("Hello World!")
  })
})
