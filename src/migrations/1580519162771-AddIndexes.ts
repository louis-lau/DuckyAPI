import { MigrationInterface, QueryRunner } from 'typeorm'
import { MongoQueryRunner } from 'typeorm/driver/mongodb/MongoQueryRunner'

export class AddIndexes1580519162771 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const mongoRunner = queryRunner as MongoQueryRunner
    mongoRunner.createCollectionIndex('api-keys', 'userId')
    mongoRunner.createCollectionIndex('users', 'username', { unique: true })
    mongoRunner.createCollectionIndexes('users', [
      {
        key: {
          'domains.domain': 1,
        },
        unique: true,
        partialFilterExpression: { 'domains.domain': { $exists: true } },
      },
    ])
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    const mongoRunner = queryRunner as MongoQueryRunner
    mongoRunner.dropCollectionIndex('api-keys', 'userId')
    mongoRunner.dropCollectionIndex('users', 'username')
    mongoRunner.dropCollectionIndex('users', 'domains.domain')
  }
}
