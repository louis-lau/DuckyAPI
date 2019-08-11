import * as bcrypt from "bcrypt"
import * as mongoose from "mongoose"
import * as mongooseLeanId from "mongoose-lean-id"
import * as mongooseUniqueArray from "mongoose-unique-array"

function HashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export const UserSchema = new mongoose.Schema({
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
  .plugin(mongooseLeanId)
  .plugin(mongooseUniqueArray)
