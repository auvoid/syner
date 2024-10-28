import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1730125194874 implements MigrationInterface {
    name = 'Migration1730125194874'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "location" character varying NOT NULL, "hash" character varying NOT NULL, CONSTRAINT "UQ_45baee512d1e3b668efe945033f" UNIQUE ("location"), CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "container" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_74656f796df3346fa6ec89fa727" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "signature" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "email" character varying NOT NULL, "signature" character varying NOT NULL, "belongsToId" uuid, CONSTRAINT "PK_8e62734171afc1d7c9570be27fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "container_files_file" ("containerId" uuid NOT NULL, "fileId" uuid NOT NULL, CONSTRAINT "PK_e86fd21956107e8cf3b9977e331" PRIMARY KEY ("containerId", "fileId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_74468701b0fe6fea49b8838982" ON "container_files_file" ("containerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d904fa14bf8e0066a0fbc78113" ON "container_files_file" ("fileId") `);
        await queryRunner.query(`ALTER TABLE "signature" ADD CONSTRAINT "FK_ea02b9a49745e5e02dcd206d344" FOREIGN KEY ("belongsToId") REFERENCES "container"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "container_files_file" ADD CONSTRAINT "FK_74468701b0fe6fea49b8838982a" FOREIGN KEY ("containerId") REFERENCES "container"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "container_files_file" ADD CONSTRAINT "FK_d904fa14bf8e0066a0fbc781130" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "container_files_file" DROP CONSTRAINT "FK_d904fa14bf8e0066a0fbc781130"`);
        await queryRunner.query(`ALTER TABLE "container_files_file" DROP CONSTRAINT "FK_74468701b0fe6fea49b8838982a"`);
        await queryRunner.query(`ALTER TABLE "signature" DROP CONSTRAINT "FK_ea02b9a49745e5e02dcd206d344"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d904fa14bf8e0066a0fbc78113"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_74468701b0fe6fea49b8838982"`);
        await queryRunner.query(`DROP TABLE "container_files_file"`);
        await queryRunner.query(`DROP TABLE "signature"`);
        await queryRunner.query(`DROP TABLE "container"`);
        await queryRunner.query(`DROP TABLE "file"`);
    }

}
