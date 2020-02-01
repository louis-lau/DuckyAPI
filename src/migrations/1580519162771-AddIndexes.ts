import { MigrationInterface, QueryRunner } from 'typeorm'
import { MongoQueryRunner } from 'typeorm/driver/mongodb/MongoQueryRunner'

export class AddIndexes1580519162771 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const mongoRunner = queryRunner as MongoQueryRunner
    mongoRunner.createCollectionIndex('api-keys', 'userId')
    mongoRunner.createCollectionIndex('users', 'username', { unique: true })
    mongoRunner.createCollectionIndex('users', 'domains.domain', { unique: true })
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    const mongoRunner = queryRunner as MongoQueryRunner
    mongoRunner.dropCollectionIndex('api-keys', 'userId')
    mongoRunner.dropCollectionIndex('users', 'username')
    mongoRunner.dropCollectionIndex('users', 'domains.domain')
  }
}
