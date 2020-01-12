import { Test, TestingModule } from '@nestjs/testing'

import { FiltersController } from './filters.controller'

describe('Filters Controller', (): void => {
  let controller: FiltersController

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [FiltersController],
      }).compile()

      controller = module.get<FiltersController>(FiltersController)
    },
  )

  it('should be defined', (): void => {
    expect(controller).toBeDefined()
  })
})
