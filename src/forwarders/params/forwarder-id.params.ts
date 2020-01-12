import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId } from 'class-validator'

export class ForwarderIdParams {
  @ApiProperty({ description: 'Unique id of the forwarder' })
  @IsMongoId()
  public forwarderId: string
}
