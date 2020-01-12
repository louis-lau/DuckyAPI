import { ApiProperty } from '@nestjs/swagger'
import { IsAscii, IsNotEmpty, IsOptional, IsString, NotContains } from 'class-validator'

export class UpdateUserDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'The username for this user',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsAscii()
  @NotContains(' ', { message: 'username must not contain spaces' })
  public username?: string

  @ApiProperty({
    example: 'supersecret',
    description: 'The password for this user',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  public password?: string
}
