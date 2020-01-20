import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId } from 'class-validator'

export class UserIdParams {
  @ApiProperty({
    example: '5d49e11f600a423ffc0b1297',
    description: 'Unique id for the user',
  })
  @IsMongoId()
  id: string
}
