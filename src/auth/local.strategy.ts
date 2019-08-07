import { Strategy } from "passport-local"
import { PassportStrategy } from "@nestjs/passport"
import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { LoginDto } from "./login.dto"
import { validateOrReject } from "class-validator"

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  public constructor(private readonly authService: AuthService) {
    super()
  }

  public async validate(username: string, password: string): Promise<any> {
    // Use class-validator to validate type, Nestjs doesn't do this automatically here because this is an authguard
    let loginDto = new LoginDto()
    loginDto.username = username
    loginDto.password = password
    try {
      await validateOrReject(loginDto)
    } catch (error) {
      throw new BadRequestException(error)
    }

    const user = await this.authService.validateUser(loginDto.username, loginDto.password)
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
