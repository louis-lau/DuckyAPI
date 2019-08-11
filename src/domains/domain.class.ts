import { ApiModelProperty } from "@nestjs/swagger"

export class Domain {
  @ApiModelProperty({ example: "example.com", description: "The domain name" })
  public domain: string

  @ApiModelProperty({
    example: true,
    description: "If this user is the domain admin, when admins remove a domain it's removed for everyone"
  })
  public admin: boolean
}
