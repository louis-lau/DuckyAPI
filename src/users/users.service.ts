import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import Shortid from 'shortid'
import { Domain } from 'src/domains/domain.entity'
import { MongoRepository } from 'typeorm'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
  ) {}
  private readonly logger = new Logger(UsersService.name, true)

  public async findByUsername(username: string): Promise<User | undefined> {
    username = username.toLowerCase()
    return this.userRepository.findOne({
      username: username,
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

  public async pushDomain(userId: string, domain: Domain): Promise<User | undefined> {
    const user = await this.findByIdNoPassword(userId)
    const userEntity = new User()
    Object.assign(userEntity, user)

    userEntity.domains.push(domain)

    try {
      return await this.userRepository.save(userEntity)
    } catch (error) {
      // TODO: add custom exception handler for unknown errors that basically does the following:
      const errorId = Shortid.generate()
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
      const errorId = Shortid.generate()
      this.logger.error(`${errorId}: ${error.message}`)
      throw new InternalServerErrorException(`Unknown error: ${errorId}`)
    }
  }

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.username = createUserDto.username.toLowerCase()
    const createdUser = this.userRepository.create(createUserDto)
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

  public async updateUser(userId: string, updateuserDto: UpdateUserDto): Promise<User> {
    const user = await this.findByIdNoPassword(userId)
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
}
