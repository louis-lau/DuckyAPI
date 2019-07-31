import { Controller, Request, UseGuards, Post, Body } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { AuthService } from "./auth.service"
import {
  ApiUseTags,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse
} from "@nestjs/swagger"
import { LoginDto } from "./login.dto"
import { AccessToken } from "./access-token.class"

@Controller("auth")
@ApiUseTags("Authentication")
@ApiBadRequestResponse({ description: "Error that is resolvable user side" })
@ApiInternalServerErrorResponse({ description: "Server error that is not resolvable user side" })
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard("local"))
  @Post("login")
  @ApiCreatedResponse({ description: "Login successful", type: AccessToken })
  @ApiUnauthorizedResponse({ description: "Invalid username or password" })
  public async login(@Request() req, @Body() body: LoginDto): Promise<object> {
    return this.authService.login(req.user)
  }
}
