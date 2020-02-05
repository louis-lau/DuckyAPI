import { Test, TestingModule } from '@nestjs/testing'

import { ApiKeysController } from './api-keys.controller'

describe('ApiKeys Controller', () => {
  let controller: ApiKeysController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiKeysController],
    }).compile()

    controller = module.get<ApiKeysController>(ApiKeysController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
