import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import Helmet from 'helmet'

import { AppModule } from './app.module'
import { UnauthorizedExceptionFilter } from './common/filters/unauthorized-exception.filter'
import { ConfigService } from './config/config.service'

declare const module: any

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  const config: ConfigService = app.get('ConfigService')

  app.setGlobalPrefix(config.BASE_URL)

  if (config.DELAY) {
    app.use(function (req, res, next) {
      setTimeout(next, config.DELAY)
    })
  }

  app.enableCors()
  app.useGlobalFilters(new UnauthorizedExceptionFilter())
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false, value: false },
      exceptionFactory: (errors: ValidationError[]): BadRequestException =>
        new BadRequestException(errors, 'ValidationError'),
    }),
  )
  app.use(Helmet())

  const options = new DocumentBuilder()
    .setTitle('DuckyAPI')
    .setDescription('A customer facing api for WildDuck')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication')
    .addTag('Api Keys')
    .addTag('Domains')
    .addTag('Dkim')
    .addTag('Email Accounts')
    .addTag('Filters')
    .addTag('Forwarders')
    .addTag('Profile')
    .addTag('Users')
    .addTag('Packages')
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup(`${config.BASE_URL}/swagger`, app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: 0,
      displayRequestDuration: true,
      displayOperationId: true,
    },
  })

  await app.listen(config.PORT)

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose((): Promise<void> => app.close())
  }
}
bootstrap()
