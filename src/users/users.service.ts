import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import * as shortid from "shortid"
import { Domain } from "src/domains/domain.class"

import { CreateUserDto } from "./create-user.dto"
import { UserDocument } from "./user-document.interface"
import { User } from "./user.class"

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name, true)

  public constructor(@InjectModel("User") private readonly userModel: Model<UserDocument>) {}

  public async findOne(username: string): Promise<User | undefined> {
    return await this.userModel
      .findOne({ username: username })
      .lean()
      .exec()
  }

  public async findById(id: string): Promise<User | undefined> {
    return await this.userModel
      .findById(id)
      .lean()
      .exec()
  }

  public async findByDomain(domain: string): Promise<User[] | undefined> {
    return await this.userModel
      .find({ "domains.domain": domain })
      .lean()
      .exec()
  }

  public async pushDomain(userId: string, domain: Domain): Promise<UserDocument | undefined> {
    const user = await this.userModel.findById(userId).exec()
    user.domains.push(domain)
    try {
      return await user.save()
    } catch (error) {
      // TODO: add custom exception handler for unknown errors that basically does the following:
      const errorId = shortid.generate()
      this.logger.error(`${errorId}: ${error.message}`)
      throw new InternalServerErrorException(`Unknown error: ${errorId}`)
    }
  }

  public async pullDomain(userId: string, domain: string): Promise<UserDocument | undefined> {
    const user = await this.userModel.findByIdAndUpdate(userId, {
      $pull: {
        domains: {
          domain: domain
        }
      }
    })
    try {
      return await user.save()
    } catch (error) {
      // TODO: add custom exception handler for unknown errors that basically does the following:
      const errorId = shortid.generate()
      this.logger.error(`${errorId}: ${error.message}`)
      throw new InternalServerErrorException(`Unknown error: ${errorId}`)
    }
  }

  public async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto)
    try {
      return await createdUser.save()
    } catch (error) {
      switch (error.code) {
        case 11000:
          throw new BadRequestException("This user already exists")

        default:
          throw new InternalServerErrorException("Unknown error")
      }
    }
  }
}
