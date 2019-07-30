import { Document } from "mongoose"
import { User } from "./user.class"

export interface UserDocument extends User, Document {}
