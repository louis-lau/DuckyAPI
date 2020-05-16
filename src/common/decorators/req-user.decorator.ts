import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { User } from 'src/users/user.entity'

export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => ctx.switchToHttp().getRequest().user.user,
)
