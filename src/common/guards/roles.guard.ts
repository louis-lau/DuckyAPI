import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    let roles = this.reflector.get<string[]>('roles', context.getHandler())
    if (!roles) {
      roles = this.reflector.get<string[]>('roles', context.getClass())
    }
    if (!roles) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const user = request.user.user
    const hasRole = (): boolean => user.roles.some(role => roles.includes(role))
    if (user && user.roles && hasRole()) {
      return true
    }

    throw new ForbiddenException('You do not have the permission to access this resource.', 'PermissionForbidden')
  }
}
