import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ObjectId } from 'mongodb'
import { UsersService } from 'src/users/users.service'
import { MongoRepository } from 'typeorm'

import { Package } from './package.entity'

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepository: MongoRepository<Package>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  public async getPackages(): Promise<Package[]> {
    return this.packageRepository.find()
  }

  public async getPackageById(id: string): Promise<Package> {
    return this.packageRepository.findOne(id)
  }

  public async savePackage(packagep: Package): Promise<Package> {
    if (packagep._id) {
      packagep._id = new ObjectId(packagep._id)
    }
    const packageEntity = this.packageRepository.create(packagep)
    return this.packageRepository.save(packageEntity)
  }

  public async deletePackage(id: string): Promise<void> {
    if ((await this.usersService.countByPackage(id)) > 0) {
      throw new BadRequestException('Can not delete a package with users assigned to it', 'PackageInUseError')
    }
    this.packageRepository.delete(id)
  }
}
