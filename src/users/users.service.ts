import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ObjectID, ObjectId } from 'mongodb'
import NanoId from 'nanoid'
import { Domain } from 'src/domains/domain.entity'
import { Package } from 'src/packages/package.entity'
import { PackagesService } from 'src/packages/packages.service'
import { MongoRepository } from 'typeorm'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
    @Inject(forwardRef(() => PackagesService))
    private readonly packagesService: PackagesService,
  ) {}
  private readonly logger = new Logger(UsersService.name, true)

  public async findByUsername(username: string): Promise<User | undefined> {
    username = username.toLowerCase()
    return this.userRepository.findOne({
      username: username,
    })
  }

  public async findByPackage(packageId: string): Promise<User[]> {
    return this.userRepository.find({
      where: {
        package: new ObjectId(packageId),
      },
    })
  }

  public async countByPackage(packageId: string): Promise<number> {
    return this.userRepository.count({
      where: {
        package: new ObjectId(packageId),
      },
    })
  }

  public async findById(id: string): Promise<User | undefined> {
    return this.userRepository.findOne(id)
  }

  public async findByIdNoPassword(id: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne(id)
    delete user.password
    return user
  }

  public async findByDomain(domain: string): Promise<User[] | undefined> {
    return this.userRepository.find({
      where: {
        'domains.domain': domain,
      },
    })
  }

  public async countByDomain(domain: string): Promise<number> {
    return this.userRepository.count({
      where: {
        'domains.domain': domain,
      },
    })
  }

  public async pushDomain(userId: string, domain: Domain): Promise<User | undefined> {
    const user = await this.findByIdNoPassword(userId)
    const userEntity = new User()
    Object.assign(userEntity, user)

    userEntity.domains.push(domain)

    try {
      return await this.userRepository.save(userEntity)
    } catch (error) {
      // TODO: add custom exception handler for unknown errors that basically does the following:
      const errorId = NanoId()
      this.logger.error(`${errorId}: ${error.message}`)
      throw new InternalServerErrorException(`Unknown error: ${errorId}`)
    }
  }

  public async updateMinTokenDate(userId: string, date = new Date()): Promise<User | undefined> {
    const user = await this.findByIdNoPassword(userId)
    const userEntity = new User()
    Object.assign(userEntity, user)

    userEntity.minTokenDate = date

    try {
      return await this.userRepository.save(userEntity)
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException('Unknown error')
    }
  }

  public async pullDomain(userId: string, domain: string): Promise<User> {
    const user = await this.findByIdNoPassword(userId)
    const userEntity = new User()
    Object.assign(userEntity, user)

    // New array of only domains that don't match domain.
    userEntity.domains = userEntity.domains.filter(domainObject => domainObject.domain !== domain)

    try {
      return this.userRepository.save(userEntity)
    } catch (error) {
      // TODO: add custom exception handler for unknown errors that basically does the following:
      const errorId = NanoId()
      this.logger.error(`${errorId}: ${error.message}`)
      throw new InternalServerErrorException(`Unknown error: ${errorId}`)
    }
  }

  public async createUser(createUserDto: CreateUserDto, admin = false): Promise<User> {
    createUserDto.username = createUserDto.username.toLowerCase()

    let userPackage: Package
    if (!admin) {
      userPackage = await this.packagesService.getPackageById(createUserDto.packageId)
      if (!userPackage) {
        throw new BadRequestException(`No package found with id ${createUserDto.packageId}`, 'PackageNotFoundError')
      }
    }

    const newUser: Partial<User> = {
      package: !admin ? new ObjectId(createUserDto.packageId) : undefined,
      quota: !admin ? userPackage.quota : undefined,
      roles: admin ? ['admin'] : ['user'],
    }
    Object.assign(newUser, createUserDto)

    const createdUser = this.userRepository.create(newUser)

    try {
      return await this.userRepository.save(createdUser)
    } catch (error) {
      switch (error.code) {
        case 11000:
          throw new BadRequestException('This user already exists', 'UserExistsError')

        default:
          throw new InternalServerErrorException('Unknown error')
      }
    }
  }

  public async updateUsernameOrPassword(userId: string, updateuserDto: UpdateUserDto): Promise<User> {
    const user = await this.findByIdNoPassword(userId)
    if (!user) {
      throw new NotFoundException(`No user found with id: ${userId}`)
    }
    const userEntity = new User()
    Object.assign(userEntity, user)

    if (updateuserDto.username) {
      updateuserDto.username = updateuserDto.username.toLowerCase()
      userEntity.username = updateuserDto.username
    }
    if (updateuserDto.password) {
      userEntity.password = updateuserDto.password
    }

    try {
      return await this.userRepository.save(userEntity)
    } catch (error) {
      switch (error.code) {
        case 11000:
          throw new BadRequestException('This username is already taken', 'UserExistsError')

        default:
          throw new InternalServerErrorException('Unknown error')
      }
    }
  }

  public async updatePackage(userId: string, packageId: string): Promise<User> {
    const userPackage = await this.packagesService.getPackageById(packageId)
    if (!userPackage) {
      throw new BadRequestException(`No package found with id ${packageId}`, 'PackageNotFoundError')
    }

    const user = await this.findByIdNoPassword(userId)
    if (!user) {
      throw new NotFoundException(`No user found with id: ${userId}`)
    }

    const userEntity = new User()
    Object.assign(userEntity, user)

    userEntity.package = new ObjectId(packageId)
    userEntity.quota = userPackage.quota

    return this.userRepository.save(userEntity)
  }

  public async replaceQuotasForPackage(packageId: string, oldQuota: number, newQuota: number): Promise<void> {
    this.userRepository.update(
      {
        package: new ObjectID(packageId),
        quota: oldQuota,
      },
      {
        quota: newQuota,
      },
    )
  }
}
