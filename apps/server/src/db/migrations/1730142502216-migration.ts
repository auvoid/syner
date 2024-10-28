import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1730142502216 implements MigrationInterface {
    name = 'Migration1730142502216'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signature" DROP CONSTRAINT "FK_ea02b9a49745e5e02dcd206d344"`);
        await queryRunner.query(`ALTER TABLE "signature" RENAME COLUMN "belongsToId" TO "containerId"`);
        await queryRunner.query(`ALTER TABLE "signature" ADD CONSTRAINT "FK_eba1b707debbb5f9840eaa4ca19" FOREIGN KEY ("containerId") REFERENCES "container"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signature" DROP CONSTRAINT "FK_eba1b707debbb5f9840eaa4ca19"`);
        await queryRunner.query(`ALTER TABLE "signature" RENAME COLUMN "containerId" TO "belongsToId"`);
        await queryRunner.query(`ALTER TABLE "signature" ADD CONSTRAINT "FK_ea02b9a49745e5e02dcd206d344" FOREIGN KEY ("belongsToId") REFERENCES "container"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
