import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1730134858079 implements MigrationInterface {
    name = 'Migration1730134858079'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "container" ADD "invitees" text array NOT NULL`);
        await queryRunner.query(`ALTER TABLE "container" ADD "ownedById" uuid`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_b2d8e683f020f61115edea206b3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "container" ADD CONSTRAINT "FK_5c0c16fcb1826f6cf660b47cecb" FOREIGN KEY ("ownedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "container" DROP CONSTRAINT "FK_5c0c16fcb1826f6cf660b47cecb"`);
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_b2d8e683f020f61115edea206b3"`);
        await queryRunner.query(`ALTER TABLE "container" DROP COLUMN "ownedById"`);
        await queryRunner.query(`ALTER TABLE "container" DROP COLUMN "invitees"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "userId"`);
    }

}
