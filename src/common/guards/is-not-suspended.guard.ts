import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class IsNotSuspendedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    let isNotSuspendedDecorator = this.reflector.get<string[]>('isNotSuspended', context.getHandler())
    if (!isNotSuspendedDecorator) {
      isNotSuspendedDecorator = this.reflector.get<string[]>('isNotSuspended', context.getClass())
    }
    if (!isNotSuspendedDecorator) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user.user

    if (user && !user.suspended) {
      return true
    }

    throw new ForbiddenException(
      'You do not have the permission to do this, because your account has been suspended.',
      'SuspendedForbiddenError',
    )
  }
}
