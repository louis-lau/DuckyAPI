import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { ObjectId } from 'mongodb'
import NanoId from 'nanoid'
import { ApiKeyAccessToken } from 'src/api-keys/class/api-key-access-token'
import { User } from 'src/users/user.entity'
import { MongoRepository } from 'typeorm'

import { ApiKey } from './api-key.entity'

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: MongoRepository<ApiKey>,
    private readonly jwtService: JwtService,
  ) {}

  public async generateApiKey(user: User, name: string): Promise<ApiKeyAccessToken> {
    const payload = {
      sub: user._id,
      type: 'api_key',
    }
    const keyId = NanoId()
    const expireDate = new Date()
    expireDate.setFullYear(expireDate.getFullYear() + 100)
    this.addKey({
      _id: keyId,
      issuedAt: new Date(),
      name: name,
      userId: new ObjectId(user._id),
    })
    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: `36500d`,
        jwtid: keyId,
      }),
      details: {
        _id: keyId,
        issuedAt: new Date(),
        name: name,
      },
    }
  }

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
