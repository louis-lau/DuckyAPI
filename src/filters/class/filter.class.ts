import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class Filter {
  @ApiPropertyOptional({ example: 'Mark as seen from John', description: 'The name of the filter' })
  @IsOptional()
  @IsString()
  public name?: string

  @ApiPropertyOptional({ example: false, description: 'If true, then this filter is ignored' })
  @IsOptional()
  @IsBoolean()
  public disabled?: boolean
}
