import { ApiModelProperty } from "@nestjs/swagger"
import { Domain } from "src/domains/domain.class"

export class User {
  @ApiModelProperty({ example: "5d49e11f600a423ffc0b1297", description: "Unique id for this user" })
  // any type is needed here so _id is the same type as it is on Document
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public _id: any

  @ApiModelProperty({ example: "johndoe", description: "The username for this user" })
  public username: string

  @ApiModelProperty({ example: "supersecret", description: "The password for this user" })
  public password?: string

  @ApiModelProperty({
    example: "2012-04-23T18:25:43.511Z",
    description: "The date after which we should consider a jwt token valid for this user"
  })
  public minTokenDate: Date

  @ApiModelProperty({ example: ["example.com", "domain.com"], description: "Domains this user can manage" })
  public domains: Domain[]
}
