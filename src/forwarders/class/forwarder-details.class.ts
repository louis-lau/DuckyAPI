import { ApiProperty } from '@nestjs/swagger'

import { Forwarder } from './forwarder.class'

class ForwarderDetailsForwards {
  @ApiProperty({ example: 100, description: 'How many messages can be forwarded per period' })
  public allowed: number

  @ApiProperty({ example: 56, description: 'How many messages were forwarded in the current period' })
  public used: number

  @ApiProperty({ example: 3600, description: 'Seconds until the end of the current period' })
  public ttl: number
}

class ForwarderDetailsLimits {
  @ApiProperty({ description: 'Forwarding quota' })
  public forward: ForwarderDetailsForwards
}

export class ForwarderDetails extends Forwarder {
  @ApiProperty({ example: 'John Doe', description: 'Identity name' })
  public name: string

  @ApiProperty({
    example: ['johndoe@example.com', 'smtp://mx.example.com:25', 'https://example.com'],
    description: 'List of forwarding targets',
  })
  public targets: string[]

  @ApiProperty({ description: 'Forwarder limits and usage' })
  public limits: ForwarderDetailsLimits
}
