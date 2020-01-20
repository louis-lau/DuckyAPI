import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId, IsOptional } from 'class-validator'

import { UpdateUserDto } from './update-user.dto'

export class UpdateUserAdminDto extends UpdateUserDto {
  @ApiProperty({
    example: '5d49e11f600a423ffc0b1297',
    description: 'Package id to assign to this user',
  })
  @IsOptional()
  @IsMongoId()
  public packageId?: string
}
