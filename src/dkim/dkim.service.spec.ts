import { Test, TestingModule } from '@nestjs/testing'

import { DkimService } from './dkim.service'

describe('DkimService', (): void => {
  let service: DkimService

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [DkimService],
      }).compile()

      service = module.get<DkimService>(DkimService)
    },
  )

  it('should be defined', (): void => {
    expect(service).toBeDefined()
  })
})
