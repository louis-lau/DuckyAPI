import { MigrationInterface, QueryRunner } from 'typeorm'
import { MongoQueryRunner } from 'typeorm/driver/mongodb/MongoQueryRunner'

export class PackageToPackageId1589835792874 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const mongoRunner = queryRunner as MongoQueryRunner
    await mongoRunner.updateMany(
      'users',
      {},
      {
        $rename: {
          package: 'packageId',
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
        $rename: {
          packageId: 'package',
        },
      },
    )
  }
}
