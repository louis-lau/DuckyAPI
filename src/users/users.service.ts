import { Injectable } from "@nestjs/common"
import { Model } from "mongoose"
import { InjectModel } from "@nestjs/mongoose"
import { CreateUserDto } from "./create-user.dto"
import { User } from "./user.class"
import { UserDocument } from "./user-document.interface"

@Injectable()
export class UsersService {
  public constructor(@InjectModel("User") private readonly userModel: Model<UserDocument>) {}

  public async findOne(username: string): Promise<User | undefined> {
    return await this.userModel.findOne({ username: username }).exec()
  }

  public async findById(id: string): Promise<User | undefined> {
    return await this.userModel.findById(id).exec()
  }

  public async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto)
    return await createdUser.save()
  }
}