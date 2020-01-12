import { ApiModelProperty } from '@nestjs/swagger'

import { CreateUpdateFilterDto } from '../dto/create-update-filter.dto'

export class FilterDetails extends CreateUpdateFilterDto {
  @ApiModelProperty({ example: '5a1c0ee490a34c67e266931c', description: 'Unique id of the filter' })
  public id: string
}
