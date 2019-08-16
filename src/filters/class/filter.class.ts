import { ApiModelProperty } from "@nestjs/swagger"
import { IsBoolean, IsOptional, IsString } from "class-validator"

export class Filter {
  @ApiModelProperty({ example: "Mark as seen from John", description: "The name of the filter", required: false })
  @IsOptional()
  @IsString()
  public name?: string

  @ApiModelProperty({ example: false, description: "If true, then this filter is ignored", required: false })
  @IsOptional()
  @IsBoolean()
  public disabled?: boolean
}
