import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase5PriceSnapshotting1780012800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. Add snapshot columns (nullable — must backfill first) ─────────────
    await queryRunner.query(`
      ALTER TABLE "inventory_movements"
        ADD COLUMN "unit_cost_price"    DECIMAL(12, 2),
        ADD COLUMN "unit_selling_price" DECIMAL(12, 2)
    `);

    // ── 2. Best-effort backfill from current product prices ──────────────────
    // New rows will always have prices populated by the service layer.
    await queryRunner.query(`
      UPDATE "inventory_movements" im
      SET
        unit_cost_price    = p.cost_price,
        unit_selling_price = p.selling_price
      FROM "products" p
      WHERE im.product_id = p.id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inventory_movements"
        DROP COLUMN "unit_cost_price",
        DROP COLUMN "unit_selling_price"
    `);
  }
}
