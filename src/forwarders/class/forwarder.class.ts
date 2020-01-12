import { ApiProperty } from '@nestjs/swagger'

export class Forwarder {
  @ApiProperty({ example: '59cb948ad80a820b68f05230', description: 'The unique id of the forwarder' })
  public id: string

  @ApiProperty({ example: 'john@example.com', description: 'The E-Mail address of the forwarder' })
  public address: string
}
