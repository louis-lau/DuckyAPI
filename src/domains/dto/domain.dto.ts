import { ApiProperty } from '@nestjs/swagger'
import { IsFQDN, IsNotEmpty } from 'class-validator'

export class DomainDto {
  @ApiProperty({ example: 'example.com', description: 'The domain name' })
  @IsNotEmpty()
  @IsFQDN()
  public domain: string
}
