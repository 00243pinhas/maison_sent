import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitRolesAndUsers1779667200000 implements MigrationInterface {
  name = 'InitRolesAndUsers1779667200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."roles_name_enum" AS ENUM (
        'SUPER_ADMIN',
        'ADMIN',
        'WAREHOUSE_MANAGER',
        'BRANCH_MANAGER',
        'SALES_STAFF'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id"          uuid                          NOT NULL DEFAULT gen_random_uuid(),
        "name"        "public"."roles_name_enum"    NOT NULL,
        "description" character varying(255),
        "created_at"  TIMESTAMPTZ                   NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMPTZ                   NOT NULL DEFAULT now(),
        "deleted_at"  TIMESTAMPTZ,
        CONSTRAINT "UQ_roles_name"    UNIQUE ("name"),
        CONSTRAINT "PK_roles_id"      PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"            uuid                NOT NULL DEFAULT gen_random_uuid(),
        "full_name"     character varying(150) NOT NULL,
        "email"         character varying(180) NOT NULL,
        "password"      character varying      NOT NULL,
        "refresh_token" character varying,
        "role_id"       uuid                NOT NULL,
        "location_id"   uuid,
        "created_at"    TIMESTAMPTZ         NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMPTZ         NOT NULL DEFAULT now(),
        "deleted_at"    TIMESTAMPTZ,
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
        ADD CONSTRAINT "FK_users_role_id"
        FOREIGN KEY ("role_id") REFERENCES "roles"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_role_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TYPE "public"."roles_name_enum"`);
  }
}
