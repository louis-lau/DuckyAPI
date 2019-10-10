import { ApiModelProperty } from "@nestjs/swagger"
import { IsFQDN, IsNotEmpty } from "class-validator"

export class DomainParams {
  @ApiModelProperty({ description: "example.com" })
  @IsNotEmpty()
  @IsFQDN()
  public domain: string
}
