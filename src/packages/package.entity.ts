import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { ObjectId } from 'mongodb'
import { AfterLoad, Column, Entity, ObjectIdColumn } from 'typeorm'

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

  @ApiPropertyOptional({
    example: 1073741824,
    description: 'Storage quota in bytes, 0 is unlimited',
  })
  @IsOptional()
  @Column()
  @IsNumber()
  @Min(0)
  public quota?: number

  @Column()
  @ApiPropertyOptional({
    example: 200,
    description: 'Max send quota for accounts created by this user, 0 is unlimited',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  public maxSend?: number

  @Column()
  @ApiPropertyOptional({
    example: 1000,
    description: 'Max recieve quota for accounts created by this user, 0 is unlimited',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  public maxReceive?: number

  @Column()
  @ApiPropertyOptional({
    example: 100,
    description: 'Max forward quota for accounts created by this user, 0 is unlimited',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  public maxForward?: number

  @AfterLoad()
  private async setMissingLimitsToZero(): Promise<void> {
    const limits = ['quota', 'maxSend', 'maxReceive', 'maxForward']
    for (const limit of limits) {
      if (this[limit] === undefined) {
        this[limit] = 0
      }
    }
  }
}
