import { Controller, Request, UseGuards, Post } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { AuthService } from "./auth.service"
import {
  ApiUseTags,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiImplicitBody
} from "@nestjs/swagger"
import { LoginDto } from "./login.dto"
import { AccessToken } from "./class/access-token.class"

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
