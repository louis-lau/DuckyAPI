import { Controller, Get } from "@nestjs/common"
import { AddressData } from "./addresses.interfaces"
import { AddressesService } from "./addresses.service"

@Controller("addresses")
export class AddressesController {
  public constructor(private readonly addressesService: AddressesService) {}

  @Get()
  private getAddresses(): AddressData[] {
    return this.addressesService.getAddresses()
  }
}
