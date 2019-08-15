import { ApiModelProperty } from "@nestjs/swagger"

import { Filter } from "./filter.class"

export class FilterListItem extends Filter {
  @ApiModelProperty({ example: "5a1c0ee490a34c67e266931c", description: "Unique id of the filter" })
  public id: string

  @ApiModelProperty({ example: ["from", "(John)"], description: "A list of query descriptions" })
  public query: string[]

  @ApiModelProperty({ example: ["mark as read"], description: "A list of action descriptions" })
  public action: string[]

  @ApiModelProperty({
    example: "2019-08-14T15:14:25.176Z",
    description: "Datestring of the time the filter was created"
  })
  public created: string
}
