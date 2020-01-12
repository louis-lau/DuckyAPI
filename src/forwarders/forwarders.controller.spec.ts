import { Test, TestingModule } from '@nestjs/testing'

import { ForwardersController } from './forwarders.controller'

describe('Forwarders Controller', (): void => {
  let controller: ForwardersController

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [ForwardersController],
      }).compile()

      controller = module.get<ForwardersController>(ForwardersController)
    },
  )

  it('should be defined', (): void => {
    expect(controller).toBeDefined()
  })
})
