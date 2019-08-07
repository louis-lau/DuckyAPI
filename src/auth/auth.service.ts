import { Injectable } from "@nestjs/common"
import { UsersService } from "src/users/users.service"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import { UserDocument } from "src/users/user-document.interface"

@Injectable()
export class AuthService {
  public constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  public async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username)
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        delete user.password
        return user
      }
    }
    return null
  }

  public async login(user: UserDocument): Promise<object> {
    const payload = { sub: user.id }
    return {
      accessToken: this.jwtService.sign(payload)
    }
  }
}
