import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase7AddStaleTransferType1780185600000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "notification_type_enum"
        ADD VALUE IF NOT EXISTS 'STALE_TRANSFER_REMINDER'
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing enum values.
    // To roll back: recreate the enum without this value and update all references.
  }
}
