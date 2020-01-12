import { ApiProperty } from '@nestjs/swagger'

export class AccessToken {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG5kb2UiLCJzdWIiOiI1ZDM1ZDczZmU0YTY3NzVmYjQxZmE0ZjEiLCJpYXQiOjE1NjM5MTU0OTgsImV4cCI6MTU2MzkxNTc5OH0.qYejtBl1Tcv9IWgp9Ax5FiR6uT_W0VwizHkB-3S7_r0',
    description: 'Access token that can be used to authenticate against the api',
  })
  public accessToken: string

  @ApiProperty({
    example: '2019-09-01T22:12:08.882Z',
    description: 'The expiry date of the access token',
  })
  public expires: Date
}
