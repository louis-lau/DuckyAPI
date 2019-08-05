import { ApiModelProperty } from "@nestjs/swagger"
import { IsMongoId } from "class-validator"

export class GetAccountDetailsParams {
  @ApiModelProperty({ example: "59cb948ad80a820b68f05230", description: "Unique id of the account" })
  @IsMongoId()
  public id: string
}
