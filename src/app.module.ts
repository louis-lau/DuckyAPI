import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { AddressesController } from "./addresses/addresses.controller"
import { AddressesService } from "./addresses/addresses.service"

@Module({
  imports: [],
  controllers: [AppController, AddressesController],
  providers: [AppService, AddressesService]
})
export class AppModule {}
