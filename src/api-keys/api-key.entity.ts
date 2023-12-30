import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { ObjectId } from 'mongodb'
import { Column, Entity, ObjectIdColumn } from 'typeorm'

@Entity('api-keys')
export class ApiKey {
  @ObjectIdColumn()
  @ApiPropertyOptional({
    example: 'pnx97h6p64t4gau6vbub-',
    description: 'Unique id for this api key',
    readOnly: true,
  })
  public _id?: string

  @Column()
  public userId?: ObjectId

  @ApiProperty({
    example: 'API key for my script',
    description: 'Name of api key',
  })
  @IsString()
  @IsNotEmpty()
  @Column()
  public name: string

  @ApiPropertyOptional({
    example: '2019-09-01T22:12:08.882Z',
    description: 'Date the api key was issued',
    readOnly: true,
  })
  @Column()
  public issuedAt?: Date
}
