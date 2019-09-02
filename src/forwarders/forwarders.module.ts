import { HttpModule, Module } from "@nestjs/common"

import { ForwardersController } from "./forwarders.controller"
import { ForwardersService } from "./forwarders.service"

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000
    })
  ],
  exports: [ForwardersService],
  providers: [ForwardersService],
  controllers: [ForwardersController]
})
export class ForwardersModule {}
