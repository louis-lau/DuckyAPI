import { Document } from "mongoose"

import { User } from "./class/user.class"

class UserWithId extends User {
  public _id: any
}

export interface UserDocument extends UserWithId, Document {}
