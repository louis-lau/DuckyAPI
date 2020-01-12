import { ApiModelProperty } from '@nestjs/swagger'

export class Forwarder {
  @ApiModelProperty({ example: '59cb948ad80a820b68f05230', description: 'The unique id of the forwarder' })
  public id: string

  @ApiModelProperty({ example: 'john@example.com', description: 'The E-Mail address of the forwarder' })
  public address: string
}
