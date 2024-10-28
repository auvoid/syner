import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1730125288957 implements MigrationInterface {
    name = 'Migration1730125288957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "UQ_45baee512d1e3b668efe945033f"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "hash"`);
        await queryRunner.query(`ALTER TABLE "file" ADD "cid" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "cid"`);
        await queryRunner.query(`ALTER TABLE "file" ADD "hash" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "file" ADD "location" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "UQ_45baee512d1e3b668efe945033f" UNIQUE ("location")`);
    }

}
