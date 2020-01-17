import { ApiProperty } from '@nestjs/swagger'
import Bcrypt from 'bcrypt'
import { IsAscii, IsNotEmpty, IsString, NotContains } from 'class-validator'
import { Domain } from 'src/domains/domain.entity'
import { BeforeInsert, BeforeUpdate, Column, Entity, Index, ObjectIdColumn } from 'typeorm'

@Entity({
  name: 'users',
})
export class User {
  @ObjectIdColumn()
  @ApiProperty({
    example: '5d49e11f600a423ffc0b1297',
    description: 'Unique id for this user',
    readOnly: true,
  })
  public _id?: string

  @Index({
    unique: true,
  })
  @Column()
  @ApiProperty({ example: 'johndoe', description: 'The username for this user' })
  @IsNotEmpty()
  @IsString()
  @IsAscii()
  @NotContains(' ', { message: 'username must not contain spaces' })
  public username: string

  @Column()
  @ApiProperty({
    example: 'supersecret',
    description: 'The password for this user',
    writeOnly: true,
  })
  @IsNotEmpty()
  @IsString()
  public password?: string

  @Column()
  @ApiProperty({
    example: '2012-04-23T18:25:43.511Z',
    description: 'The date after which we should consider a jwt token valid for this user',
    readOnly: true,
  })
  public minTokenDate: Date

  @Column(() => Domain)
  @ApiProperty({
    type: Domain,
    isArray: true,
    description: 'Domains this user can manage',
    readOnly: true,
  })
  public domains: Domain[]

  @BeforeInsert()
  @BeforeUpdate()
  private async hashPassword(): Promise<void> {
    if (this.password) {
      this.password = await Bcrypt.hash(this.password, 10)
    }
  }

  @BeforeInsert()
  private async setMinTokenDate(): Promise<void> {
    this.minTokenDate = new Date()
  }

  @BeforeInsert()
  private async setEmptyDomainArray(): Promise<void> {
    if (!this.domains) {
      this.domains = []
    }
  }
}
