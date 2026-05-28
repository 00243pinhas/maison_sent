import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase4Transfers1779926400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. transfer_status_enum ──────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "transfer_status_enum" AS ENUM (
        'DRAFT',
        'PENDING_APPROVAL',
        'APPROVED',
        'COMPLETED',
        'REJECTED',
        'CANCELLED'
      )
    `);

    // ── 2. transfers (header) ────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "transfers" (
        "id"               uuid                    NOT NULL DEFAULT gen_random_uuid(),
        "reference_number" varchar(80),
        "from_location_id" uuid                    NOT NULL,
        "to_location_id"   uuid                    NOT NULL,
        "status"           "transfer_status_enum"  NOT NULL DEFAULT 'DRAFT',
        "notes"            text,
        "rejection_reason" text,
        "created_by"       uuid                    NOT NULL,
        "approved_by"      uuid,
        "completed_by"     uuid,
        "approved_at"      timestamptz,
        "completed_at"     timestamptz,
        "created_at"       timestamptz             NOT NULL DEFAULT now(),
        "updated_at"       timestamptz             NOT NULL DEFAULT now(),
        "deleted_at"       timestamptz,

        CONSTRAINT "PK_transfers"
          PRIMARY KEY ("id"),

        CONSTRAINT "FK_transfers_from_location"
          FOREIGN KEY ("from_location_id") REFERENCES "locations" ("id") ON DELETE RESTRICT,

        CONSTRAINT "FK_transfers_to_location"
          FOREIGN KEY ("to_location_id") REFERENCES "locations" ("id") ON DELETE RESTRICT,

        CONSTRAINT "FK_transfers_created_by"
          FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT,

        CONSTRAINT "FK_transfers_approved_by"
          FOREIGN KEY ("approved_by") REFERENCES "users" ("id") ON DELETE RESTRICT,

        CONSTRAINT "FK_transfers_completed_by"
          FOREIGN KEY ("completed_by") REFERENCES "users" ("id") ON DELETE RESTRICT,

        -- source and destination must always differ
        CONSTRAINT "CHK_transfers_diff_locations"
          CHECK (from_location_id <> to_location_id)
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_transfers_status"        ON "transfers" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_transfers_from_location" ON "transfers" ("from_location_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_transfers_to_location"   ON "transfers" ("to_location_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_transfers_created_by"    ON "transfers" ("created_by")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_transfers_created_at"    ON "transfers" ("created_at" DESC)`,
    );

    // ── 3. transfer_items (lines) ────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "transfer_items" (
        "id"          uuid        NOT NULL DEFAULT gen_random_uuid(),
        "transfer_id" uuid        NOT NULL,
        "product_id"  uuid        NOT NULL,
        "quantity"    integer     NOT NULL,
        "created_at"  timestamptz NOT NULL DEFAULT now(),
        "updated_at"  timestamptz NOT NULL DEFAULT now(),

        CONSTRAINT "PK_transfer_items"
          PRIMARY KEY ("id"),

        CONSTRAINT "FK_transfer_items_transfer"
          FOREIGN KEY ("transfer_id") REFERENCES "transfers" ("id") ON DELETE CASCADE,

        CONSTRAINT "FK_transfer_items_product"
          FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT,

        -- one line per product per transfer
        CONSTRAINT "UQ_transfer_items_transfer_product"
          UNIQUE ("transfer_id", "product_id"),

        -- quantity must be a positive integer
        CONSTRAINT "CHK_transfer_items_qty_positive"
          CHECK (quantity > 0)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transfer_items"`);
    await queryRunner.query(`DROP INDEX "IDX_transfers_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_transfers_created_by"`);
    await queryRunner.query(`DROP INDEX "IDX_transfers_to_location"`);
    await queryRunner.query(`DROP INDEX "IDX_transfers_from_location"`);
    await queryRunner.query(`DROP INDEX "IDX_transfers_status"`);
    await queryRunner.query(`DROP TABLE "transfers"`);
    await queryRunner.query(`DROP TYPE "transfer_status_enum"`);
  }
}
