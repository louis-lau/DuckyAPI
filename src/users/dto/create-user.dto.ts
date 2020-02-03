import { ApiProperty } from '@nestjs/swagger'
import { IsAscii, IsMongoId, IsNotEmpty, IsString, NotContains } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'The username for this user',
  })
  @IsNotEmpty()
  @IsString()
  @IsAscii()
  @NotContains(' ', { message: 'username must not contain spaces' })
  public username: string

  @ApiProperty({
    example: 'supersecret',
    description: 'The password for this user',
  })
  @IsNotEmpty()
  @IsString()
  public password: string

  @ApiProperty({
    example: '5d49e11f600a423ffc0b1297',
    description: 'Package id to assign to this user',
    required: true,
  })
  @IsMongoId()
  public packageId?: string
}
