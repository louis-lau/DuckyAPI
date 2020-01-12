import { Test, TestingModule } from '@nestjs/testing'

import { DomainsService } from './domains.service'

describe('DomainsService', (): void => {
  let service: DomainsService

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [DomainsService],
      }).compile()

      service = module.get<DomainsService>(DomainsService)
    },
  )

  it('should be defined', (): void => {
    expect(service).toBeDefined()
  })
})
