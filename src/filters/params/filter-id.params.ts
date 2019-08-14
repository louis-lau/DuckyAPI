import { ApiModelProperty } from "@nestjs/swagger"
import { IsMongoId } from "class-validator"

export class FilterIdParams {
  @ApiModelProperty({ example: "59cb948ad80a820b68f05230", description: "Unique id of the account" })
  @IsMongoId()
  public accountId: string

  @ApiModelProperty({ example: "59cb948ad80a820b68f05230", description: "Unique id of the filter" })
  @IsMongoId()
  public filterId: string
}
