import { Injectable } from "@nestjs/common"
import { AddressData } from "./addresses.interfaces"

@Injectable()
export class AddressesService {
  public getAddresses(): AddressData[] {
    // Create 25 addresses
    let addresses: AddressData[] = []
    for (let i = 1; i <= 25; i++) {
      let randomAllowed = Math.floor(Math.random() * Math.floor(10)) * 1073741824
      let randomUsed = Math.floor(Math.random() * Math.floor(randomAllowed))

      let user: AddressData = {
        id: `59cb948ad80a820b68f0523${i}`,
        name: `John Doe ${i}`,
        address: `john${i}@domain.com`,
        quotaAllowed: randomAllowed,
        quotaUsed: randomUsed,
        disabled: false
      }
      addresses.push(user)
    }
    return addresses
  }
}
