import { BootstrapConsole } from 'nestjs-console'

import { AppModule } from './app.module'

const bootstrap = new BootstrapConsole({
  module: AppModule,
  useDecorators: true,
  contextOptions: {
    logger: ['error'],
  },
})
bootstrap.init().then(async app => {
  try {
    // init the app
    await app.init()
    // boot the cli
    await bootstrap.boot()
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})
