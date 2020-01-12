import { ApiModelProperty } from '@nestjs/swagger'
import { IsMongoId } from 'class-validator'

export class ForwarderIdParams {
  @ApiModelProperty({ description: 'Unique id of the forwarder' })
  @IsMongoId()
  public forwarderId: string
}
