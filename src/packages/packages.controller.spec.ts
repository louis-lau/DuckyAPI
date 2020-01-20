import { Test, TestingModule } from '@nestjs/testing'

import { PackagesController } from './packages.controller'

describe('Packages Controller', () => {
  let controller: PackagesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackagesController],
    }).compile()

    controller = module.get<PackagesController>(PackagesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
