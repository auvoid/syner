import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1730218354382 implements MigrationInterface {
    name = 'Migration1730218354382'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signature" DROP COLUMN "name"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signature" ADD "name" character varying NOT NULL`);
    }

}
