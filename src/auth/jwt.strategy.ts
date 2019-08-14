import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { jwtConstants } from "src/constants"
import { UsersService } from "src/users/users.service"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  public constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret
    })
  }

  public async validate(payload: any): Promise<object | false> {
    const issuedAt = new Date(payload.iat * 1000)
    const user = await this.usersService.findById(payload.sub)
    if (user && issuedAt > user.minTokenDate) {
      delete user.password
      return user
    } else {
      return null
    }
  }
}
