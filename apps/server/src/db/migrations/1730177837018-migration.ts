import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1730177837018 implements MigrationInterface {
    name = 'Migration1730177837018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "container" ADD "name" character varying NOT NULL DEFAULT 'Signable Document'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "container" DROP COLUMN "name"`);
    }

}
