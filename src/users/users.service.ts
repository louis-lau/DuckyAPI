import { Injectable } from "@nestjs/common"

export type User = any

@Injectable()
export class UsersService {
  private readonly users: User[]

  public constructor() {
    this.users = [
      {
        userId: 1,
        username: "john",
        password: "changeme"
      },
      {
        userId: 2,
        username: "chris",
        password: "secret"
      },
      {
        userId: 3,
        username: "maria",
        password: "guess"
      },
      {
        userId: 4,
        username: "louis",
        password: "jemoeder2"
      }
    ]
  }

  public async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user): boolean => user.username === username)
  }
}
