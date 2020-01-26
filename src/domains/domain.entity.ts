import { ApiProperty } from '@nestjs/swagger'
import { Column, Index } from 'typeorm'

export class Domain {
  @Column()
  @Index({
    unique: true,
  })
  @ApiProperty({ example: 'example.com', description: 'The domain name' })
  public domain: string

  @Column()
  @ApiProperty({
    example: true,
    description: "If this user is the domain admin, when admins remove a domain it's removed for everyone",
  })
  public admin?: boolean

  @ApiProperty({ example: false, description: 'If DKIM is active for this domain' })
  public dkim?: boolean
}
