import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1730106310886 implements MigrationInterface {
    name = 'Migration1730106310886'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isValid" boolean NOT NULL DEFAULT true, "did" character varying, "userId" uuid, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cred_offer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "offer" jsonb NOT NULL, CONSTRAINT "PK_39cba514c6210e771fcb2babb31" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "siop_offer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "request" text NOT NULL, "pex" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_69419371d37d76e4d436f5b735c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "did" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_7d4ee7205853cfea0f68240b589" UNIQUE ("did")`);
        await queryRunner.query(`ALTER TABLE "user" ADD "emailVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emailVerified"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_7d4ee7205853cfea0f68240b589"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "did"`);
        await queryRunner.query(`DROP TABLE "siop_offer"`);
        await queryRunner.query(`DROP TABLE "cred_offer"`);
        await queryRunner.query(`DROP TABLE "session"`);
    }

}
