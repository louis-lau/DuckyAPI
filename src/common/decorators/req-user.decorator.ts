import { createParamDecorator } from '@nestjs/common'
import { User } from 'src/users/class/user.class'

export const ReqUser = createParamDecorator((data, req): User => req.user)
