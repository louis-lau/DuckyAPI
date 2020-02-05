import { Command, Console, createSpinner } from 'nestjs-console'
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
    const spinner = createSpinner()

    spinner.start(`Getting user info for ${username}`)
    const user = await this.usersService.findByUsername(username)
    if (user) {
      spinner.succeed(`Got user: ${username}`)
    } else {
      spinner.fail(`No such user: ${username}`)
      process.exit(1)
    }

    spinner.start('Creating api key')
    const apiKey = await this.apiKeysService.generateApiKey(user, keyName)
    spinner.succeed('Created api key, dumping details:')
    console.log(apiKey)
    process.exit(0)
  }
}
