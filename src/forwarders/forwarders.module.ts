import { Module } from "@nestjs/common"

import { ForwardersController } from "./forwarders.controller"
import { ForwardersService } from "./forwarders.service"

@Module({
  providers: [ForwardersService],
  controllers: [ForwardersController]
})
export class ForwardersModule {}
