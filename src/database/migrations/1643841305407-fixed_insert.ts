import {MigrationInterface, QueryRunner} from "typeorm";

export class fixedInsert1643841305407 implements MigrationInterface {
    name = 'fixedInsert1643841305407'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_details" ALTER COLUMN "name" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_details" ALTER COLUMN "name" SET NOT NULL`);
    }

}
