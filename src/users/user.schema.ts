import * as mongoose from "mongoose"
import * as bcrypt from "bcrypt"
import * as mongooseLeanId from "mongoose-lean-id"

function HashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String, set: HashPassword },
  minTokenDate: { type: Date, default: Date.now },
  domains: [{ type: String }]
}).plugin(mongooseLeanId)
