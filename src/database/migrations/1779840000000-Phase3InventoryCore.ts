import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase3InventoryCore1779840000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // movement_type_enum
    await queryRunner.query(`
      CREATE TYPE "movement_type_enum" AS ENUM (
        'RECEIVED', 'SALE', 'RETURN', 'DAMAGE',
        'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'TRANSFER'
      )
    `);

    // inventory_movements — append-only, no updated_at / deleted_at
    await queryRunner.query(`
      CREATE TABLE "inventory_movements" (
        "id"                 uuid                 NOT NULL DEFAULT gen_random_uuid(),
        "product_id"         uuid                 NOT NULL,
        "movement_type"      "movement_type_enum" NOT NULL,
        "quantity"           integer              NOT NULL,
        "from_location_id"   uuid,
        "to_location_id"     uuid,
        "reference_number"   varchar(80),
        "performed_by"       uuid                 NOT NULL,
        "notes"              text,
        "created_at"         timestamptz          NOT NULL DEFAULT now(),

        CONSTRAINT "PK_inventory_movements"
          PRIMARY KEY ("id"),

        CONSTRAINT "FK_inv_mov_product"
          FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT,

        CONSTRAINT "FK_inv_mov_from_location"
          FOREIGN KEY ("from_location_id") REFERENCES "locations" ("id") ON DELETE RESTRICT,

        CONSTRAINT "FK_inv_mov_to_location"
          FOREIGN KEY ("to_location_id") REFERENCES "locations" ("id") ON DELETE RESTRICT,

        CONSTRAINT "FK_inv_mov_performer"
          FOREIGN KEY ("performed_by") REFERENCES "users" ("id") ON DELETE RESTRICT,

        -- quantity must always be a positive integer
        CONSTRAINT "CHK_inv_mov_qty_positive"
          CHECK (quantity > 0),

        -- at least one location must be set
        CONSTRAINT "CHK_inv_mov_at_least_one_location"
          CHECK (from_location_id IS NOT NULL OR to_location_id IS NOT NULL),

        -- source and destination must differ
        CONSTRAINT "CHK_inv_mov_diff_locations"
          CHECK (
            from_location_id IS NULL
            OR to_location_id IS NULL
            OR from_location_id <> to_location_id
          )
      )
    `);

    // indexes on inventory_movements
    await queryRunner.query(
      `CREATE INDEX "IDX_inv_mov_product_id"   ON "inventory_movements" ("product_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_inv_mov_from_location" ON "inventory_movements" ("from_location_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_inv_mov_to_location"   ON "inventory_movements" ("to_location_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_inv_mov_type"          ON "inventory_movements" ("movement_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_inv_mov_created_at"    ON "inventory_movements" ("created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_inv_mov_performed_by"  ON "inventory_movements" ("performed_by")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_inv_mov_product_created" ON "inventory_movements" ("product_id", "created_at" DESC)`,
    );

    // inventory_balances — derived cache, never source of truth
    await queryRunner.query(`
      CREATE TABLE "inventory_balances" (
        "id"          uuid        NOT NULL DEFAULT gen_random_uuid(),
        "product_id"  uuid        NOT NULL,
        "location_id" uuid        NOT NULL,
        "quantity"    integer     NOT NULL DEFAULT 0,
        "updated_at"  timestamptz NOT NULL DEFAULT now(),

        CONSTRAINT "PK_inventory_balances"
          PRIMARY KEY ("id"),

        -- one balance row per (product, location) pair
        CONSTRAINT "UQ_inv_bal_product_location"
          UNIQUE ("product_id", "location_id"),

        CONSTRAINT "FK_inv_bal_product"
          FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE,

        CONSTRAINT "FK_inv_bal_location"
          FOREIGN KEY ("location_id") REFERENCES "locations" ("id") ON DELETE CASCADE,

        -- quantity is always non-negative (enforced both here and in application layer)
        CONSTRAINT "CHK_inv_bal_qty_non_negative"
          CHECK (quantity >= 0)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "inventory_balances"`);
    await queryRunner.query(`DROP INDEX "IDX_inv_mov_product_created"`);
    await queryRunner.query(`DROP INDEX "IDX_inv_mov_performed_by"`);
    await queryRunner.query(`DROP INDEX "IDX_inv_mov_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_inv_mov_type"`);
    await queryRunner.query(`DROP INDEX "IDX_inv_mov_to_location"`);
    await queryRunner.query(`DROP INDEX "IDX_inv_mov_from_location"`);
    await queryRunner.query(`DROP INDEX "IDX_inv_mov_product_id"`);
    await queryRunner.query(`DROP TABLE "inventory_movements"`);
    await queryRunner.query(`DROP TYPE "movement_type_enum"`);
  }
}
