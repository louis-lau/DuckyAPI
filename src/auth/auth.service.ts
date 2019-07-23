import { Injectable } from "@nestjs/common"
import { UsersService } from "../users/users.service"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"

@Injectable()
export class AuthService {
  public constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  public async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username)
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        let result = user
        delete result.password
        return result
      }
    }
    return null
  }

  public async login(user: any): Promise<object> {
    const payload = { username: user.username, sub: user.id }
    return {
      accessToken: this.jwtService.sign(payload)
    }
  }
}
