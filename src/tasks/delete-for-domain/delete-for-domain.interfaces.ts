import { User } from 'src/users/user.entity'

export interface DeleteForDomainData {
  user: User
  domain: string
}
