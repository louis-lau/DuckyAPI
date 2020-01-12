import Bcrypt from "bcrypt"
import Mongoose from "mongoose"
import MongooseLeanId from "mongoose-lean-id"
import MongooseUniqueArray from "mongoose-unique-array"

function HashPassword(password: string): string {
  return Bcrypt.hashSync(password, 10)
}

export const UserSchema = new Mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String, set: HashPassword },
  minTokenDate: { type: Date, default: Date.now },
  domains: [
    {
      _id: false,
      domain: { type: String, unique: true },
      admin: Boolean
    }
  ]
})
  .plugin(MongooseLeanId)
  .plugin(MongooseUniqueArray)
