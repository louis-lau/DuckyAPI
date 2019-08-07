import { Controller, Post, Request, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiImplicitBody,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
  ApiUseTags
} from "@nestjs/swagger"

import { AuthService } from "./auth.service"
import { AccessToken } from "./class/access-token.class"
import { LoginDto } from "./login.dto"

@Controller("auth")
@ApiUseTags("Authentication")
@ApiBadRequestResponse({ description: "Error that is resolvable user side" })
@ApiInternalServerErrorResponse({ description: "Server error that is not resolvable user side" })
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiImplicitBody({ name: "Password authentication", type: LoginDto })
  @UseGuards(AuthGuard("local"))
  @ApiCreatedResponse({ description: "Login successful", type: AccessToken })
  @ApiUnauthorizedResponse({ description: "Invalid username or password" })
  public async login(@Request() req): Promise<object> {
    return this.authService.login(req.user)
  }
}
