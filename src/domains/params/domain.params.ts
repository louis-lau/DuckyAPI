import { ApiProperty } from '@nestjs/swagger'
import { IsFQDN, IsNotEmpty } from 'class-validator'

export class DomainParams {
  @ApiProperty({ description: 'example.com' })
  @IsNotEmpty()
  @IsFQDN()
  public domain: string
}
