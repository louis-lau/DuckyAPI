import { Test, TestingModule } from '@nestjs/testing'

import { FiltersService } from './filters.service'

describe('FiltersService', (): void => {
  let service: FiltersService

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [FiltersService],
      }).compile()

      service = module.get<FiltersService>(FiltersService)
    },
  )

  it('should be defined', (): void => {
    expect(service).toBeDefined()
  })
})
