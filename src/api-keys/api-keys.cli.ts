import { Command, Console } from 'nestjs-console'
import { UsersService } from 'src/users/users.service'

import { ApiKeysService } from './api-keys.service'

@Console()
export class ApiKeysCli {
  public constructor(private readonly usersService: UsersService, private readonly apiKeysService: ApiKeysService) {}

  @Command({
    command: 'create-apikey <username> <keyName>',
    description: 'Create api key for any user',
  })
  async createApiKey(username: string, keyName: string): Promise<void> {
    console.log(`Getting user info for ${username}`)
    const user = await this.usersService.findByUsername(username)
    if (user) {
      console.log(`Got user: ${username}`)
    } else {
      console.log(`No such user: ${username}`)
      process.exit(1)
    }

    console.log('Creating api key')
    const apiKey = await this.apiKeysService.generateApiKey(user, keyName)
    console.log('Created api key, dumping details:')
    console.log(apiKey)
    process.exit(0)
  }
}
