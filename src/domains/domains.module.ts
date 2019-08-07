import { Module } from "@nestjs/common"
import { DomainsController } from "./domains.controller"
import { DomainsService } from "./domains.service"

@Module({
  controllers: [DomainsController],
  providers: [DomainsService]
})
export class DomainsModule {}
