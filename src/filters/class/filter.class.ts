import { ApiModelProperty } from "@nestjs/swagger"
import { IsBoolean, IsString } from "class-validator"

export class Filter {
  @ApiModelProperty({ example: "Mark as seen from John", description: "The name of the filter", required: false })
  @IsString()
  public name?: string

  @ApiModelProperty({ example: false, description: "If true, then this filter is ignored", required: false })
  @IsBoolean()
  public disabled?: boolean
}
