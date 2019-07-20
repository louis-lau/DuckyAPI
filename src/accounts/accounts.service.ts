import { Injectable } from "@nestjs/common"
import { Account } from "./classes/account.class"

@Injectable()
export class AccountsService {
  public getAccounts(): Account[] {
    // Create 25 addresses
    let accounts: Account[] = []
    for (let i = 1; i <= 25; i++) {
      let randomAllowed = Math.floor(Math.random() * Math.floor(10)) * 1073741824
      let randomUsed = Math.floor(Math.random() * Math.floor(randomAllowed))

      let user: Account = {
        id: `59cb948ad80a820b68f0523${i}`,
        name: `John Doe ${i}`,
        address: `john${i}@domain.com`,
        quotaAllowed: randomAllowed,
        quotaUsed: randomUsed,
        disabled: false
      }
      accounts.push(user)
    }
    return accounts
  }
}
