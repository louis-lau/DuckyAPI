import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId } from 'class-validator'

export class FilterIdParams {
  @ApiProperty({ description: 'Unique id of the account' })
  @IsMongoId()
  public accountId: string

  @ApiProperty({ description: 'Unique id of the filter' })
  @IsMongoId()
  public filterId: string
}
