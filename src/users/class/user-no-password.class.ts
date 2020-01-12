import { ApiModelProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { Domain } from 'src/domains/class/domain.class'

export class UserNoPassword {
  @ApiModelProperty({ example: '5d49e11f600a423ffc0b1297', description: 'Unique id for this user' })
  // any type is needed here so _id is the same type as it is on Document
  public _id: any

  @Expose()
  @ApiModelProperty({ example: 'johndoe', description: 'The username for this user' })
  public username: string

  @ApiModelProperty({
    example: '2012-04-23T18:25:43.511Z',
    description: 'The date after which we should consider a jwt token valid for this user',
  })
  public minTokenDate: Date

  @ApiModelProperty({ type: Domain, isArray: true, description: 'Domains this user can manage' })
  public domains: Domain[]
}
