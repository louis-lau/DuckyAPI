import { ApiProperty } from '@nestjs/swagger'
import { IsFQDN, IsNotEmpty } from 'class-validator'

export class DomainAliasParams {
  @ApiProperty({ description: 'example.com' })
  @IsNotEmpty()
  @IsFQDN()
  public domain: string

  @ApiProperty({ description: 'example.com' })
  @IsNotEmpty()
  @IsFQDN()
  public alias: string
}
