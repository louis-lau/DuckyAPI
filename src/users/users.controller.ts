import { Controller, Post, Body } from "@nestjs/common"
import { UsersService } from "./users.service"
import { CreateUserDto } from "./create-user.dto"
import {
  ApiCreatedResponse,
  ApiUseTags,
  ApiBearerAuth,
  ApiOperation,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse
} from "@nestjs/swagger"

@Controller("users")
@ApiUseTags("Users")
@ApiBearerAuth()
@ApiBadRequestResponse({ description: "Error that is resolvable user side" })
@ApiInternalServerErrorResponse({ description: "Server error that is not resolvable user side" })
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ title: "Create new API user" })
  @ApiCreatedResponse({ description: "User successfully created" })
  public async createUser(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.usersService.createUser(createUserDto)
  }
}
