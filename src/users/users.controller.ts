import { Controller, Post, Body } from "@nestjs/common"
import { UsersService } from "./users.service"
import { CreateUserDto } from "./create-user.dto"
import { ApiCreatedResponse, ApiBadRequestResponse, ApiUseTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"

@Controller("users")
@ApiUseTags("Users")
@ApiBearerAuth()
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @Post("create")
  @ApiOperation({ title: "Create new API user" })
  @ApiCreatedResponse({ description: "User successfully created" })
  @ApiBadRequestResponse({ description: "Error ocurred while adding user" })
  public async createUser(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.usersService.createUser(createUserDto)
  }
}
