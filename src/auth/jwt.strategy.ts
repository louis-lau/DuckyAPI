import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from 'src/config/config.service'
import { UsersService } from 'src/users/users.service'

import { ApiKeysService } from '../api-keys/api-keys.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  public constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
    private readonly apiKeysService: ApiKeysService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('TOKEN_SECRET'),
    })
  }

  public async validate(payload: any): Promise<object | false> {
    switch (payload.type) {
      case 'access_token':
        const issuedAt = new Date(payload.iat * 1000)
        const user = await this.usersService.findById(payload.sub)
        if (user && issuedAt > user.minTokenDate) {
          delete user.password
          return {
            jwt: payload,
            user: user,
          }
        }
        return null

      case 'api_key':
        if (await this.apiKeysService.getKey(payload.sub, payload.jti)) {
          // If api key exists in database
          const user = await this.usersService.findById(payload.sub)
          if (user) {
            delete user.password
            return {
              jwt: payload,
              user: user,
            }
          }
        }
        return null

      default:
        return null
    }
  }
}
