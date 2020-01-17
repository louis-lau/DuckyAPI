import { User } from 'src/users/user.entity'

export interface DeleteForDomain {
  user: User
  domain: string
}
