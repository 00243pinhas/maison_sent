import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase6Notifications1780099200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. notification_type_enum ────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "notification_type_enum" AS ENUM (
        'TRANSFER_SUBMITTED',
        'TRANSFER_APPROVED',
        'TRANSFER_REJECTED',
        'TRANSFER_COMPLETED',
        'LOW_STOCK_ALERT'
      )
    `);

    // ── 2. notifications table ───────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id"           uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "recipient_id" uuid        NOT NULL,
        "type"         "notification_type_enum" NOT NULL,
        "title"        varchar(150) NOT NULL,
        "message"      text         NOT NULL,
        "data"         jsonb,
        "read"         boolean      NOT NULL DEFAULT false,
        "read_at"      timestamptz,
        "created_at"   timestamptz  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_recipient"
          FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_recipient_read_created"
        ON "notifications" ("recipient_id", "read", "created_at" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_type"
        ON "notifications" ("type")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_recipient_type_created"
        ON "notifications" ("recipient_id", "type", "created_at" DESC)
    `);

    // ── 3. fcm_token on users ────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "fcm_token" varchar(255)
    `);

    // ── 4. low_stock_threshold on products ───────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "products"
        ADD COLUMN "low_stock_threshold" integer
          CONSTRAINT "CHK_products_low_stock_threshold"
            CHECK (low_stock_threshold IS NULL OR low_stock_threshold > 0)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "low_stock_threshold"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "fcm_token"`);
    await queryRunner.query(
      `DROP INDEX "IDX_notifications_recipient_type_created"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_notifications_type"`);
    await queryRunner.query(
      `DROP INDEX "IDX_notifications_recipient_read_created"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "notification_type_enum"`);
  }
}
