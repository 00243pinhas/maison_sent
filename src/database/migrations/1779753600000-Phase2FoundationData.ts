import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase2FoundationData1779753600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // location_type_enum
    await queryRunner.query(`
      CREATE TYPE "location_type_enum" AS ENUM ('WAREHOUSE', 'BRANCH', 'HEAD_OFFICE')
    `);

    // locations
    await queryRunner.query(`
      CREATE TABLE "locations" (
        "id"         uuid          NOT NULL DEFAULT gen_random_uuid(),
        "name"       varchar(150)  NOT NULL,
        "type"       "location_type_enum" NOT NULL DEFAULT 'BRANCH',
        "city"       varchar(100),
        "address"    text,
        "created_at" timestamptz   NOT NULL DEFAULT now(),
        "updated_at" timestamptz   NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "PK_locations"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_locations_name" UNIQUE      ("name")
      )
    `);

    // suppliers
    await queryRunner.query(`
      CREATE TABLE "suppliers" (
        "id"         uuid          NOT NULL DEFAULT gen_random_uuid(),
        "name"       varchar(150)  NOT NULL,
        "phone"      varchar(30),
        "email"      varchar(180),
        "country"    varchar(100),
        "created_at" timestamptz   NOT NULL DEFAULT now(),
        "updated_at" timestamptz   NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "PK_suppliers" PRIMARY KEY ("id")
      )
    `);

    // Partial unique index on suppliers.email (NULL values are not considered duplicates)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_suppliers_email_partial"
      ON "suppliers" ("email")
      WHERE "email" IS NOT NULL
    `);

    // categories
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id"         uuid         NOT NULL DEFAULT gen_random_uuid(),
        "name"       varchar(100) NOT NULL,
        "created_at" timestamptz  NOT NULL DEFAULT now(),
        "updated_at" timestamptz  NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "PK_categories"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_name" UNIQUE      ("name")
      )
    `);

    // product_status_enum
    await queryRunner.query(`
      CREATE TYPE "product_status_enum" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED')
    `);

    // products
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id"            uuid                  NOT NULL DEFAULT gen_random_uuid(),
        "name"          varchar(200)          NOT NULL,
        "brand"         varchar(150)          NOT NULL,
        "sku"           varchar(64)           NOT NULL,
        "barcode"       varchar(64),
        "category_id"   uuid                  NOT NULL,
        "supplier_id"   uuid                  NOT NULL,
        "cost_price"    decimal(12,2)         NOT NULL,
        "selling_price" decimal(12,2)         NOT NULL,
        "size_ml"       integer               NOT NULL,
        "status"        "product_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at"    timestamptz           NOT NULL DEFAULT now(),
        "updated_at"    timestamptz           NOT NULL DEFAULT now(),
        "deleted_at"    timestamptz,
        CONSTRAINT "PK_products"          PRIMARY KEY  ("id"),
        CONSTRAINT "UQ_products_sku"      UNIQUE       ("sku"),
        CONSTRAINT "FK_products_category" FOREIGN KEY  ("category_id") REFERENCES "categories" ("id"),
        CONSTRAINT "FK_products_supplier" FOREIGN KEY  ("supplier_id") REFERENCES "suppliers"  ("id")
      )
    `);

    // Partial unique index on products.barcode (NULL values are not considered duplicates)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_products_barcode_partial"
      ON "products" ("barcode")
      WHERE "barcode" IS NOT NULL
    `);

    // Retrofit FK: users.location_id → locations.id (ON DELETE SET NULL)
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD CONSTRAINT "FK_users_location"
        FOREIGN KEY ("location_id") REFERENCES "locations" ("id")
        ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_location"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_products_barcode_partial"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TYPE "product_status_enum"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP INDEX "IDX_suppliers_email_partial"`);
    await queryRunner.query(`DROP TABLE "suppliers"`);
    await queryRunner.query(`DROP TABLE "locations"`);
    await queryRunner.query(`DROP TYPE "location_type_enum"`);
  }
}
