import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe())

  const options = new DocumentBuilder()
    .setTitle("DuckyAPI")
    .setDescription("A customer facing api for WildDuck")
    .setVersion("1.0")
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup("", app, document)

  await app.listen(3000)
}
bootstrap()
