import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { validateOrReject } from 'class-validator'
import { Strategy } from 'passport-local'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  public constructor(private readonly authService: AuthService) {
    super()
  }

  public async validate(username: string, password: string): Promise<any> {
    // Use class-validator to validate type, Nestjs doesn't do this automatically here because this is an authguard
    const loginDto = new LoginDto()
    loginDto.username = username
    loginDto.password = password
    try {
      await validateOrReject(loginDto)
    } catch (errors) {
      throw new BadRequestException(errors, 'ValidationError')
    }

    const user = await this.authService.validateUser(loginDto.username, loginDto.password)
    if (!user) {
      throw new UnauthorizedException()
    }
    return {
      user: user,
    }
  }
}
