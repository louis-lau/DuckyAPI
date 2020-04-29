import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsMongoId, IsOptional } from 'class-validator'

import { UpdateUserDto } from './update-user.dto'

export class UpdateUserAdminDto extends UpdateUserDto {
  @ApiProperty({
    example: '5d49e11f600a423ffc0b1297',
    description: 'Package id to assign to this user',
  })
  @IsOptional()
  @IsMongoId()
  public packageId?: string

  @ApiProperty({
    example: false,
    description:
      "A suspended user doesn't have access to most api methods, and all accounts and forwarders are suspended",
  })
  @IsOptional()
  @IsBoolean()
  public suspended?: boolean
}
