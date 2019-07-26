import { ExtractJwt, Strategy } from "passport-jwt"
import { PassportStrategy } from "@nestjs/passport"
import { Injectable } from "@nestjs/common"
import { jwtConstants } from "./constants"
import { UsersService } from "../users/users.service"

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
    let issuedAt = new Date(payload.iat * 1000)
    let user = await this.usersService.findById(payload.sub)
    if (issuedAt > user.minTokenDate) {
      return { userId: payload.sub, username: payload.username }
    } else {
      return null
    }
  }
}
