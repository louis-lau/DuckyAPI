import { Command, Console, createSpinner } from 'nestjs-console'
import { AuthService } from 'src/auth/auth.service'
import { UsersService } from 'src/users/users.service'

@Console()
export class AuthCli {
  public constructor(private readonly usersService: UsersService, private readonly authService: AuthService) {}

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
    const apiKey = await this.authService.createApiKey(user, keyName)
    spinner.succeed('Created api key, dumping details:')
    console.log(apiKey)
    process.exit(0)
  }
}
