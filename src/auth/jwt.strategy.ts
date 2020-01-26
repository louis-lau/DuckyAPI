import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from 'src/config/config.service'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  public constructor(private readonly usersService: UsersService, private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('TOKEN_SECRET'),
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
