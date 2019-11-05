import { Document } from "mongoose"

import { User } from "./class/user.class"

export interface UserDocument extends User, Document {}
