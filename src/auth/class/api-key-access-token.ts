import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'

import { ApiKey } from '../api-key.entity'

export class ApiKeyAcessToken {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG5kb2UiLCJzdWIiOiI1ZDM1ZDczZmU0YTY3NzVmYjQxZmE0ZjEiLCJpYXQiOjE1NjM5MTU0OTgsImV4cCI6MTU2MzkxNTc5OH0.qYejtBl1Tcv9IWgp9Ax5FiR6uT_W0VwizHkB-3S7_r0',
    description: 'API key that can be used to authenticate against the api',
  })
  public accessToken: string

  @ApiProperty({
    description: 'API key details',
  })
  @ValidateNested()
  @Type(() => ApiKey)
  public details: ApiKey
}
