import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'

@Injectable()
export class ForbidApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const jwt = request.user.jwt
    if (jwt.type === 'api_key') {
      throw new ForbiddenException(
        'This resource is forbidden when using an API key as authorization.',
        'ApiKeyForbidden',
      )
    }
    return true
  }
}
