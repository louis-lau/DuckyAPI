import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import { User } from "src/users/class/user.class"
import { UsersService } from "src/users/users.service"

import { AccessToken } from "./class/access-token.class"

@Injectable()
export class AuthService {
  public constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  public async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOne(username)
    if (user && (await bcrypt.compare(password, user.password))) {
      delete user.password
      return user
    } else {
      return null
    }
  }

  public async getAccessToken(user: User, rememberMe = false): Promise<AccessToken> {
    const payload = { sub: user._id }
    const expireHours = rememberMe ? 7 * 24 : 8
    const expireDate = new Date()
    expireDate.setHours(expireDate.getHours() + expireHours)
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: `${expireHours}h` }),
      expires: expireDate
    }
  }

  public async expireTokens(user: User): Promise<void> {
    this.usersService.updateMinTokenDate(user._id)
  }
}
