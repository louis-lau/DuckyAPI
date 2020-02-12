import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator'
import { ObjectId } from 'mongodb'
import { Column, Entity, ObjectIdColumn } from 'typeorm'

@Entity({
  name: 'packages',
})
export class Package {
  @ObjectIdColumn()
  @ApiPropertyOptional({
    example: '5d49e11f600a423ffc0b1297',
    description: 'Unique id for this package',
    readOnly: true,
  })
  public _id?: string | ObjectId

  @Column()
  @ApiProperty({
    example: 'Small',
    description: 'Display name to use for this package',
  })
  @IsString()
  @IsNotEmpty()
  public name: string

  @ApiProperty({
    example: 1073741824,
    description: 'Storage quota in bytes',
  })
  @Column()
  @IsNumber()
  @IsPositive()
  public quota: number
}
