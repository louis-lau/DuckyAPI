import { ApiProperty } from '@nestjs/swagger'

import { UserNoPassword } from './user-no-password.class'

export class User extends UserNoPassword {
  @ApiProperty({ example: 'supersecret', description: 'The password for this user' })
  public password?: string
}
