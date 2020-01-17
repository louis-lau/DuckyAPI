import { createParamDecorator } from '@nestjs/common'
import { User } from 'src/users/user.entity'

export const ReqUser = createParamDecorator((data, req): User => req.user)
