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
  })
  public _id?: string

  @Column()
  @ApiProperty({ example: 'johndoe', description: 'The username for this user' })
  public username: string

  @Column()
  public password?: string

  @Column()
  public minTokenDate: Date

  @Column(() => Domain)
  @ApiProperty({
    type: Domain,
    isArray: true,
    description: 'Domains this user can manage',
  })
  public domains: Domain[]

  @Column()
  public package: ObjectId

  @Column()
  @ApiProperty({
    example: 1073741824,
    description: 'Storage quota in bytes',
  })
  public quota: number

  @Column()
  @ApiProperty({
    example: false,
    description:
      "A suspended user doesn't have access to most api methods, and all accounts and forwarders are suspended",
  })
  public suspended: boolean

  @Column()
  @ApiProperty({
    example: ['user'],
    description: 'User roles',
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
