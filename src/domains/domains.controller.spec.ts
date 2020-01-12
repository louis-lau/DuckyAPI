import { Test, TestingModule } from '@nestjs/testing'

import { DomainsController } from './domains.controller'

describe('Domains Controller', (): void => {
  let controller: DomainsController

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [DomainsController],
      }).compile()

      controller = module.get<DomainsController>(DomainsController)
    },
  )

  it('should be defined', (): void => {
    expect(controller).toBeDefined()
  })
})
