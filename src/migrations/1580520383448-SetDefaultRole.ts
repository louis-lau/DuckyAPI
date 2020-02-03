import { MigrationInterface, QueryRunner } from 'typeorm'
import { MongoQueryRunner } from 'typeorm/driver/mongodb/MongoQueryRunner'

export class SetDefaultRole1580520383448 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const mongoRunner = queryRunner as MongoQueryRunner
    await mongoRunner.updateMany(
      'users',
      {},
      {
        $set: {
          roles: ['user'],
        },
      },
    )
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    const mongoRunner = queryRunner as MongoQueryRunner
    await mongoRunner.updateMany(
      'users',
      {},
      {
        $unset: {
          roles: '',
        },
      },
    )
  }
}
