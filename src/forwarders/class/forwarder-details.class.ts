import { ApiModelProperty } from "@nestjs/swagger"

import { Forwarder } from "./forwarder.class"

class ForwarderDetailsForwards {
  @ApiModelProperty({ example: 100, description: "How many messages can be forwarded per period" })
  public allowed: number

  @ApiModelProperty({ example: 56, description: "How many messages were forwarded in the current period" })
  public used: number

  @ApiModelProperty({ example: 3600, description: "Seconds until the end of the current period" })
  public ttl: number
}

class ForwarderDetailsLimits {
  @ApiModelProperty({ description: "Forwarding quota" })
  public forwards: ForwarderDetailsForwards
}

export class ForwarderDetails extends Forwarder {
  @ApiModelProperty({ example: "John Doe", description: "Identity name" })
  public name: string

  @ApiModelProperty({
    example: ["johndoe@example.com", "smtp://mx.example.com:25", "https://example.com"],
    description: "List of forwarding targets"
  })
  public targets: string[]

  @ApiModelProperty({ description: "Forwarder limits and usage" })
  public limits: ForwarderDetailsLimits
}
