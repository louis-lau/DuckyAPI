import { ApiProperty } from '@nestjs/swagger'

export class Domain {
  @ApiProperty({ example: 'example.com', description: 'The domain name' })
  public domain: string

  @ApiProperty({
    example: true,
    description: "If this user is the domain admin, when admins remove a domain it's removed for everyone",
  })
  public admin?: boolean = true

  @ApiProperty({ example: false, description: 'If DKIM is active for this domain' })
  public dkim?: boolean = false
}
