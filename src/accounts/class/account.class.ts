import { ApiProperty } from '@nestjs/swagger'

export class Account {
  @ApiProperty({ example: '59cb948ad80a820b68f05230', description: 'The unique id of the email account' })
  public id: string

  @ApiProperty({ example: 'John Doe', description: 'The name of the email account' })
  public name: string | null

  @ApiProperty({ example: 'john@example.com', description: 'The E-Mail address of the email account' })
  public address: string

  @ApiProperty({
    example: false,
    description: 'If true then the account can not authenticate or receive any new mail',
  })
  public disabled: boolean
}
