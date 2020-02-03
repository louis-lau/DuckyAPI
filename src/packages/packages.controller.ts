import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { UsersService } from 'src/users/users.service'

import { PackageIdParams } from './dto/package-id.params'
import { Package } from './package.entity'
import { PackagesService } from './packages.service'

@Controller('packages')
@ApiTags('Packages')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
@ApiBadRequestResponse({ description: 'Error that is resolvable user side' })
@ApiInternalServerErrorResponse({ description: 'Server error that is not resolvable user side' })
export class PackagesController {
  public constructor(
    private readonly packagesService: PackagesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({ summary: '[Admin only] Get a list of packages' })
  @ApiOkResponse({ description: 'List of packages', type: Package, isArray: true })
  public async getPackages(): Promise<Package[]> {
    return this.packagesService.getPackages()
  }

  @Post()
  @ApiOperation({ summary: '[Admin only] Create package' })
  @ApiCreatedResponse({ description: 'Successfully created package', type: Package })
  public async createPackage(@Body() packaget: Package): Promise<Package> {
    return this.packagesService.savePackage(packaget)
  }

  @Put(':id')
  @ApiOperation({
    summary: '[Admin only] Update package',
    description: 'Will also update quota for existing users, except if you modified the users quota manually.',
  })
  @ApiOkResponse({ description: 'Successfully updated package', type: Package })
  public async updatePackage(@Body() packaget: Package, @Param() packageIdParams: PackageIdParams): Promise<Package> {
    const oldPackage = await this.packagesService.getPackageById(packageIdParams.id)
    if (oldPackage) {
      packaget._id = packageIdParams.id
      const savedPackage = await this.packagesService.savePackage(packaget)
      await this.usersService.replaceQuotasForPackage(packaget._id, oldPackage.quota, packaget.quota)
      return savedPackage
    } else {
      throw new NotFoundException(`No package found with id ${packageIdParams.id}`, 'PackageNotFoundError')
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: '[Admin only] Delete package' })
  @ApiOkResponse({ description: 'Successfully deleted package', type: Package })
  public async deletePackage(@Param() packageIdParams: PackageIdParams): Promise<void> {
    return this.packagesService.deletePackage(packageIdParams.id)
  }
}
