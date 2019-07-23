import { Document } from "mongoose"
import { User } from "../classes/user.class"

export interface UserDocument extends User, Document {}
