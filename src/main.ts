import { BadRequestException, ValidationError, ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import * as helmet from "helmet"

import { AppModule } from "./app.module"

// No type for this
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const module: any

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false, value: false },
      exceptionFactory: (errors: ValidationError[]): BadRequestException =>
        new BadRequestException(errors, "ValidationError")
    })
  )
  app.use(helmet())

  const options = new DocumentBuilder()
    .setTitle("DuckyAPI")
    .setDescription("A customer facing api for WildDuck")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Authentication")
    .addTag("Domains")
    .addTag("DKIM")
    .addTag("Email Accounts")
    .addTag("Forwarders")
    .addTag("Filters")
    .addTag("Users")
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup("/swagger", app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: 0,
      operationsSorter: "method",
      displayRequestDuration: true
    }
  })

  await app.listen(3000)

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose((): Promise<void> => app.close())
  }
}
bootstrap()
