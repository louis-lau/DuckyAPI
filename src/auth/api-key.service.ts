import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ObjectId } from 'mongodb'
import { MongoRepository } from 'typeorm'

import { ApiKey } from './api-key.entity'

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: MongoRepository<ApiKey>,
  ) {}

  public async addKey(apiKey: ApiKey): Promise<void> {
    this.apiKeyRepository.insert(apiKey)
  }

  public async getKey(userId: string, keyId: string): Promise<ApiKey | undefined> {
    return this.apiKeyRepository.findOne({
      _id: keyId,
      userId: new ObjectId(userId),
    })
  }

  public async revokeKey(userId: string, keyId: string): Promise<void> {
    this.apiKeyRepository.delete({
      _id: keyId,
      userId: new ObjectId(userId),
    })
  }

  public async getKeysForUser(userId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      select: ['_id', 'name', 'issuedAt'],
      where: { userId: new ObjectId(userId) },
    })
  }
}
