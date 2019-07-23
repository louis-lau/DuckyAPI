import { Controller, Request, UseGuards, Post } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { AuthService } from "./auth.service"
import { ApiUseTags } from "@nestjs/swagger"

@Controller("auth")
@ApiUseTags("Authentication")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard("local"))
  @Post("login")
  public async login(@Request() req): Promise<object> {
    return this.authService.login(req.user)
  }
}
