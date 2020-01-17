import { ApiProperty } from '@nestjs/swagger'

import { Filter } from './filter.class'

export class FilterListItem extends Filter {
  @ApiProperty({ example: '5a1c0ee490a34c67e266931c', description: 'Unique id of the filter' })
  public id: string

  @ApiProperty({
    example: [
      ['from', '(John)'],
      ['to', '(John)'],
    ],
    description: 'A list of query descriptions',
  })
  public query: string[][]

  @ApiProperty({
    example: [['mark it as spam'], ['forward to', 'johndoe@example.com, smtp://mx.example.com:25, example.com']],
    description: 'A list of action descriptions',
  })
  public action: string[][]

  @ApiProperty({
    example: '2019-08-14T15:14:25.176Z',
    description: 'Datestring of the time the filter was created',
  })
  public created: string
}
