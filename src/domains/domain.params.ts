import { ApiModelProperty } from "@nestjs/swagger"
import { IsFQDN, IsNotEmpty } from "class-validator"

export class DomainParams {
  @ApiModelProperty({ example: "example.com" })
  @IsNotEmpty()
  @IsFQDN()
  public domain: string
}
