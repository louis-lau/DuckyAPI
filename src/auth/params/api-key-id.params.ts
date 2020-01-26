import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class ApiKeyIdParams {
  @ApiProperty({
    example: 'pnx97h6p64t4gau6vbub-',
    description: 'Unique id of the api key',
  })
  @IsString()
  @IsNotEmpty()
  public id: string
}
