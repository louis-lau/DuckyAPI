import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import { User } from "src/users/user.class"
import { UsersService } from "src/users/users.service"

@Injectable()
export class AuthService {
  public constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  public async validateUser(username: string, password: string): Promise<User | null> {
    let user = await this.usersService.findOne(username)
    if (user && (await bcrypt.compare(password, user.password))) {
      delete user.password
      return user
    } else {
      return null
    }
  }

  public async login(user: User): Promise<object> {
    const payload = { sub: user._id }
    return {
      accessToken: this.jwtService.sign(payload)
    }
  }
}
