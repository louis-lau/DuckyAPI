import { ApiModelProperty } from "@nestjs/swagger"
import { IsMongoId } from "class-validator"

export class FilterIdParams {
  @ApiModelProperty({ description: "Unique id of the account" })
  @IsMongoId()
  public accountId: string

  @ApiModelProperty({ description: "Unique id of the filter" })
  @IsMongoId()
  public filterId: string
}
