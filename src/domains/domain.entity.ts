import { ApiProperty } from '@nestjs/swagger'
import { IsFQDN, IsNotEmpty } from 'class-validator'
import { Column } from 'typeorm'

export class DomainAlias {
  @Column()
  @ApiProperty({ example: 'example.com', description: 'The domain name' })
  @IsNotEmpty()
  @IsFQDN()
  public domain: string

  @ApiProperty({ example: false, readOnly: true, description: 'If DKIM is active for this domain' })
  public dkim?: boolean
}

export class Domain extends DomainAlias {
  @Column()
  @ApiProperty({
    example: true,
    readOnly: true,
    description: 'If this user is the domain admin, this currently serves no function',
  })
  public admin?: boolean

  @Column(() => DomainAlias)
  @ApiProperty({
    description: 'Domains aliased to this domain',
    readOnly: true,
    type: DomainAlias,
    isArray: true,
  })
  public aliases?: DomainAlias[]
}
