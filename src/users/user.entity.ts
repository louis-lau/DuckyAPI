import { ApiProperty } from '@nestjs/swagger'
import Bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'
import { Domain } from 'src/domains/domain.entity'
import { BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn } from 'typeorm'

@Entity('users')
export class User {
  @ObjectIdColumn()
  @ApiProperty({
    example: '5d49e11f600a423ffc0b1297',
    description: 'Unique id for this user',
    readOnly: true,
  })
  public _id?: string

  @Column()
  @ApiProperty({ example: 'johndoe', description: 'The username for this user' })
  public username: string

  @Column()
  @ApiProperty({
    example: 'supersecret',
    description: 'The password for this user',
    writeOnly: true,
  })
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

  @Column()
  public package: ObjectId

  @Column()
  @ApiProperty({
    example: 1073741824,
    description: 'Storage quota in bytes',
    readOnly: true,
  })
  public quota: number

  @Column()
  @ApiProperty({
    example: ['user'],
    description: 'User roles',
    readOnly: true,
  })
  public roles: string[]

  @BeforeInsert()
  @BeforeUpdate()
  private async hashPassword(): Promise<void> {
    if (this.password) {
      this.password = await Bcrypt.hash(this.password, 10)
    }
  }

  @BeforeInsert()
  private async setDefaultInsertValues(): Promise<void> {
    this.minTokenDate = new Date()
    if (!this.domains) {
      this.domains = []
    }
  }
}
