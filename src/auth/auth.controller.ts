import { Controller, Request, UseGuards, Post } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { AuthService } from "./auth.service"

@Controller("auth")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard("local"))
  @Post("login")
  public async login(@Request() req): Promise<any> {
    return this.authService.login(req.user)
  }
}
