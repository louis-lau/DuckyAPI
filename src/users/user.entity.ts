import { ApiProperty } from '@nestjs/swagger'
import Bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'
import { Domain } from 'src/domains/domain.entity'
import { AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn } from 'typeorm'

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
  public domains: Domain[]

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

  @Column()
  @ApiProperty({
    example: '5d49e11f600a423ffc0b1297',
    description: 'Package id for this user',
    type: String,
  })
  public packageId?: ObjectId

  @Column()
  @ApiProperty({
    example: 1073741824,
    description: 'Storage quota in bytes, 0 is unlimited',
  })
  public quota?: number

  @Column()
  @ApiProperty({
    example: 200,
    description: 'Max send quota for accounts created by this user, 0 is unlimited',
  })
  public maxSend?: number

  @Column()
  @ApiProperty({
    example: 1000,
    description: 'Max recieve quota for accounts created by this user, 0 is unlimited',
  })
  public maxReceive?: number

  @Column()
  @ApiProperty({
    example: 100,
    description: 'Max forward quota for accounts created by this user, 0 is unlimited',
  })
  public maxForward?: number

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
