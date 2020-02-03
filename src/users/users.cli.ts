import genPassword from 'generate-password'
import { Command, Console, createSpinner } from 'nestjs-console'

import { CreateUserDto } from './dto/create-user.dto'
import { UsersService } from './users.service'

@Console()
export class UsersCli {
  public constructor(private readonly usersService: UsersService) {}

  @Command({
    command: 'create-admin <username> [password]',
    description: 'Create admin user',
  })
  async createAdmin(username: string, password?: string): Promise<void> {
    const spinner = createSpinner()

    if (!password) {
      spinner.start(`Generating password`)
      password = genPassword.generate({
        length: 12,
        numbers: true,
        excludeSimilarCharacters: true,
      })
      spinner.succeed('Password generated')
    }

    spinner.start(`Creating admin user with username: "${username}" and password: "${password}"`)
    const user: CreateUserDto = {
      username: username,
      password: password,
    }

    try {
      await this.usersService.createUser(user, true)
    } catch (error) {
      spinner.fail(`Failed creating admin user with username: "${username}" and password: "${password}":`)
      console.error(error)
      process.exit(1)
    }
    spinner.succeed(`Created admin user with username: "${username}" and password: "${password}"`)
    process.exit(0)
  }
}
