import { InjectQueue } from '@nestjs/bull'
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
import { Queue } from 'bull'
import { ObjectID, ObjectId } from 'mongodb'
import { nanoid as NanoId } from 'nanoid'
import { Domain, DomainAlias } from 'src/domains/domain.entity'
import { DomainsService } from 'src/domains/domains.service'
import { Package } from 'src/packages/package.entity'
import { PackagesService } from 'src/packages/packages.service'
import { DeleteForDomainData } from 'src/tasks/delete-for-domain/delete-for-domain.interfaces'
import { SuspensionData } from 'src/tasks/suspension/suspension.interfaces'
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
    @Inject(forwardRef(() => DomainsService))
    private readonly domainsService: DomainsService,
    @InjectQueue('suspension')
    readonly suspensionQueue: Queue<SuspensionData>,
    @InjectQueue('deleteForDomain')
    readonly deleteForDomainQueue: Queue<DeleteForDomainData>,
  ) {}
  private readonly logger = new Logger(UsersService.name, true)

  public async getUsers(): Promise<User[]> {
    return this.userRepository.find()
  }

  public async findByUsername(username: string): Promise<User | undefined> {
    username = username.toLowerCase()
    return this.userRepository.findOne({
      username: username,
    })
  }

  public async findByPackage(packageId: string): Promise<User[]> {
    return this.userRepository.find({
      where: {
        packageId: new ObjectId(packageId),
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
    if (!user) {
      return undefined
    }
    delete user.password
    return user
  }

  public async deleteUser(id: string, onlyDeleteDomainsAndSuspend = false): Promise<void> {
    const user = await this.findByIdNoPassword(id)
    if (user) {
      await this.domainsService.deleteAllDomains(user)
      if (onlyDeleteDomainsAndSuspend) {
        this.suspend(id, true)
      } else {
        this.userRepository.delete(id)
      }
    }
  }

  public async findByDomain(domain: string): Promise<User[] | undefined> {
    return this.userRepository.find({
      where: {
        $or: [
          {
            'domains.domain': domain,
          },
          {
            'domains.aliases': domain,
          },
        ],
      },
    })
  }

  public async countByDomain(domain: string): Promise<number> {
    return this.userRepository.count({
      $or: [
        {
          'domains.domain': domain,
        },
        {
          'domains.aliases': domain,
        },
      ],
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

  public async pullDomain(userId: string, domain: string): Promise<User> {
    const user = await this.findByIdNoPassword(userId)
    const userEntity = new User()
    Object.assign(userEntity, user)

    // New array of only domains that don't match domain.
    userEntity.domains = userEntity.domains.filter((domainObject) => domainObject.domain !== domain)

    try {
      return this.userRepository.save(userEntity)
    } catch (error) {
      // TODO: add custom exception handler for unknown errors that basically does the following:
      const errorId = NanoId()
      this.logger.error(`${errorId}: ${error.message}`)
      throw new InternalServerErrorException(`Unknown error: ${errorId}`)
    }
  }

  public async pushAlias(userId: string, domain: string, alias: DomainAlias): Promise<User | undefined> {
    const user = await this.findByIdNoPassword(userId)
    const userEntity = new User()
    Object.assign(userEntity, user)

    userEntity.domains = userEntity.domains.map((userDomain) => {
      if (userDomain.domain === domain) {
        if (!userDomain.aliases) {
          userDomain.aliases = []
        }
        userDomain.aliases.push(alias)
      }
      return userDomain
    })

    try {
      return await this.userRepository.save(userEntity)
    } catch (error) {
      const errorId = NanoId()
      this.logger.error(`${errorId}: ${error.message}`)
      throw new InternalServerErrorException(`Unknown error: ${errorId}`)
    }
  }

  public async pullAlias(userId: string, alias: string): Promise<User> {
    const user = await this.findByIdNoPassword(userId)
    const userEntity = new User()
    Object.assign(userEntity, user)

    userEntity.domains = userEntity.domains.map((userDomain) => {
      if (userDomain.aliases) {
        // New array of only aliases that don't match alias.
        userDomain.aliases = userDomain.aliases.filter((domainAlias) => domainAlias.domain !== alias)
      }
      return userDomain
    })

    try {
      return this.userRepository.save(userEntity)
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

  public async createUser(createUserDto: CreateUserDto, admin = false): Promise<User> {
    createUserDto.username = createUserDto.username.toLowerCase()

    let userPackage: Package
    const hasPackage: boolean = !admin && createUserDto.packageId !== undefined
    if (hasPackage) {
      userPackage = await this.packagesService.getPackageById(createUserDto.packageId)
      if (!userPackage) {
        throw new BadRequestException(`No package found with id ${createUserDto.packageId}`, 'PackageNotFoundError')
      }
    }

    const newUser: Partial<User> = {
      packageId: hasPackage ? new ObjectId(createUserDto.packageId) : undefined,
      quota: hasPackage ? userPackage.quota : undefined,
      maxSend: hasPackage ? userPackage.maxSend : undefined,
      maxReceive: hasPackage ? userPackage.maxReceive : undefined,
      maxForward: hasPackage ? userPackage.maxForward : undefined,
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

    userEntity.packageId = new ObjectId(packageId)
    userEntity.quota = userPackage.quota
    userEntity.maxForward = userPackage.maxForward
    userEntity.maxReceive = userPackage.maxReceive
    userEntity.maxSend = userPackage.maxSend

    return this.userRepository.save(userEntity)
  }

  public async replacelimitForPackage(
    packageId: string,
    limit: 'quota' | 'maxForward' | 'maxReceive' | 'maxSend',
    oldLimit: number,
    newLimit: number,
  ): Promise<void> {
    this.userRepository.update(
      {
        packageId: new ObjectID(packageId),
        [limit]: oldLimit,
      },
      {
        [limit]: newLimit,
      },
    )
  }

  public async suspend(userId: string, suspend = true): Promise<void> {
    const user = await this.findByIdNoPassword(userId)
    if (!user) {
      throw new NotFoundException(`No user found with id: ${userId}`)
    }
    const userEntity = new User()
    Object.assign(userEntity, user)

    userEntity.suspended = suspend

    this.userRepository.save(userEntity)

    this.suspensionQueue.add(suspend ? 'suspendAccounts' : 'unsuspendAccounts', {
      user: userEntity,
    })
    this.suspensionQueue.add(suspend ? 'suspendForwarders' : 'unsuspendForwarders', {
      user: userEntity,
    })
  }
}
