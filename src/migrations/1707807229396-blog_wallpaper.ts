import { MigrationInterface, QueryRunner } from "typeorm";

export class BlogWallpaper1707807229396 implements MigrationInterface {
    name = 'BlogWallpaper1707807229396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "blogWallpaper" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "width" character varying NOT NULL, "height" character varying NOT NULL, "fileSize" character varying NOT NULL, "blogsId" uuid, CONSTRAINT "REL_166ac0356e0765da46482fdff8" UNIQUE ("blogsId"), CONSTRAINT "PK_663df45a1cdc5fca843e5b419c4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "blogMainImage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "width" character varying NOT NULL, "height" character varying NOT NULL, "fileSize" character varying NOT NULL, "blogsId" uuid, CONSTRAINT "REL_234d718bae0a49a0c82467a247" UNIQUE ("blogsId"), CONSTRAINT "PK_fae5ed22d81f3cf60b0f25c7213" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "blogWallpaper" ADD CONSTRAINT "FK_166ac0356e0765da46482fdff8a" FOREIGN KEY ("blogsId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blogMainImage" ADD CONSTRAINT "FK_234d718bae0a49a0c82467a2479" FOREIGN KEY ("blogsId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogMainImage" DROP CONSTRAINT "FK_234d718bae0a49a0c82467a2479"`);
        await queryRunner.query(`ALTER TABLE "blogWallpaper" DROP CONSTRAINT "FK_166ac0356e0765da46482fdff8a"`);
        await queryRunner.query(`DROP TABLE "blogMainImage"`);
        await queryRunner.query(`DROP TABLE "blogWallpaper"`);
    }

}
