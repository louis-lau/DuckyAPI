import { SetMetadata } from '@nestjs/common'

export const IsNotSuspended = (): any => SetMetadata('isNotSuspended', true)
