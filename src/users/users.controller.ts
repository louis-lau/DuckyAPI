import { Body, Controller, Post } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUseTags
} from "@nestjs/swagger"

import { CreateUserDto } from "./create-user.dto"
import { UsersService } from "./users.service"

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
