import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import fs from 'fs'
import Helmet from 'helmet'
import { resolve } from 'path'
import { promisify } from 'util'

import { AppModule } from './app.module'
import { UnauthorizedExceptionFilter } from './common/filters/unauthorized-exception.filter'
import { ConfigService } from './config/config.service'
import { openapiOptions } from './openapi-options'

const writeFile = promisify(fs.writeFile)
declare const module: any

async function bootstrap(): Promise<void> {
  const config: ConfigService = app.get('ConfigService')
  let nestConfig: {
    httpsOptions: {
        key: string,
        cert: string
    }
  }

  if (config.TLS_KEY_PATH && config.TLS_CERT_PATH) {
    const fs = require('fs');
    nestConfig.httpsOptions = {
        key: fs.readFileSync(config.TLS_KEY_PATH),
        cert: fs.readFileSync(config.TLS_CERT_PATH)
    };
  }

  const app = await NestFactory.create(AppModule, nestConfig);

  if (config.SERVE_DUCKYPANEL) {
    // Write baseurl to file for DuckyPanel to find
    await writeFile(
      resolve('node_modules/duckypanel/DuckyPanel/config/production.json'),
      `{"apiUrl":"/${config.BASE_URL}"}`,
    )
  }

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

  const document = SwaggerModule.createDocument(app, openapiOptions)
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
