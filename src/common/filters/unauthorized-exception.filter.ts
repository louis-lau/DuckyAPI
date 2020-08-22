import { ArgumentsHost, Catch, ExceptionFilter, UnauthorizedException } from '@nestjs/common'
import { Response } from 'express'

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const req = ctx.getRequest()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()

    let message: string

    if (exception.message === 'InvalidLocal') {
      message = 'Invalid username and password'
    } else if (req.authInfo?.name === 'TokenExpiredError') {
      message = 'Your access token has expired, please request a new access token'
    } else if (req.authInfo?.name === 'JsonWebTokenError') {
      message = 'Your access token has an invalid format'
    } else if (req.authInfo?.message === 'No auth token') {
      message = 'No access token provided, please provide an access token to access this resource'
    } else {
      message = 'Invalid access token'
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      error: 'UnauthorizedError',
    })
  }
}
