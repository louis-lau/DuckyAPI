import { ApiModelProperty } from "@nestjs/swagger"
import { IsFQDN, IsNotEmpty } from "class-validator"

export class DomainDto {
  @ApiModelProperty({ example: "example.com", description: "The domain name" })
  @IsNotEmpty()
  @IsFQDN()
  public domain: string
}
