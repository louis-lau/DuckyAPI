import { ApiProperty } from '@nestjs/swagger'
import { IsFQDN, IsNotEmpty } from 'class-validator'

export class DkimParams {
  @ApiProperty({ description: 'example.com' })
  @IsNotEmpty()
  @IsFQDN()
  public domainOrAlias: string
}
