import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'

export class DeleteUserDto {
  @ApiPropertyOptional({
    description: 'If true will not delete the user, but delete all domains and suspend the user',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  onlyDeleteDomainsAndSuspend: boolean
}
