import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import Bcrypt from 'bcrypt'
import NanoId from 'nanoid'
import { User } from 'src/users/user.entity'
import { UsersService } from 'src/users/users.service'

import { ApiKeysService } from '../api-keys/api-keys.service'
import { AccessToken } from './class/access-token.class'

@Injectable()
export class AuthService {
  public constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  public async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByUsername(username)
    if (user && (await Bcrypt.compare(password, user.password))) {
      delete user.password
      return user
    } else {
      return null
    }
  }

  public async getAccessToken(user: User, rememberMe = false): Promise<AccessToken> {
    const payload = {
      sub: user._id,
      type: 'access_token',
    }
    const expireHours = rememberMe ? 7 * 24 : 8
    const expireDate = new Date()
    expireDate.setHours(expireDate.getHours() + expireHours)
    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: `${expireHours}h`,
        jwtid: NanoId(),
      }),
      expires: expireDate,
    }
  }

  public async expireTokens(user: User): Promise<void> {
    this.usersService.updateMinTokenDate(user._id)
  }
}
