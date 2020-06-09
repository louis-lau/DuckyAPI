import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class Address {
  @ApiPropertyOptional({
    example: '59cb948ad80a820b68f05230',
    description: 'The unique id of the email account',
    readOnly: true,
  })
  public id?: string

  @ApiPropertyOptional({ example: 'John Doe', description: 'The name of the email account' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public name?: string | null

  @ApiProperty({ example: 'john@example.com', description: 'The E-Mail address of the email account' })
  @IsEmail()
  public address: string
}
