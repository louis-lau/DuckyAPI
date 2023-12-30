import genPassword from 'generate-password'
import { Command, Console } from 'nestjs-console'

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
    if (!password) {
      console.log(`Generating password`)
      password = genPassword.generate({
        length: 12,
        numbers: true,
        excludeSimilarCharacters: true,
      })
      console.log('Password generated')
    }

    console.log(`Creating admin user with username: "${username}" and password: "${password}"`)
    const user: CreateUserDto = {
      username: username,
      password: password,
    }

    try {
      await this.usersService.createUser(user, true)
    } catch (error) {
      console.log(`Failed creating admin user with username: "${username}" and password: "${password}":`)
      console.error(error)
      process.exit(1)
    }
    console.log(`Created admin user with username: "${username}" and password: "${password}"`)
    process.exit(0)
  }
}
