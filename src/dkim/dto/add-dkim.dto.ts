import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

export class AddDkimDto {
  @ApiProperty({ example: 'default', description: 'Selector for dkim key' })
  @IsNotEmpty()
  @IsString()
  public selector: string

  @ApiProperty({
    example: '-----BEGIN RSA PRIVATE KEY-----...',
    description:
      'Pem formatted DKIM private key. If not set then a new 2048 bit RSA key is generated, beware though that it can take several seconds to complete',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(new RegExp('^-----BEGIN (RSA )?PRIVATE KEY-----'), {
    message: 'privateKey should be a pem formatted private key',
  })
  public privateKey?: string
}
