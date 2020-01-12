import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class Filter {
  @ApiProperty({ example: 'Mark as seen from John', description: 'The name of the filter', required: false })
  @IsOptional()
  @IsString()
  public name?: string

  @ApiProperty({ example: false, description: 'If true, then this filter is ignored', required: false })
  @IsOptional()
  @IsBoolean()
  public disabled?: boolean
}
