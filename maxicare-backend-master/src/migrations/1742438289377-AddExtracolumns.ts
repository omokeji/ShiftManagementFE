import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExtracolumns1742438289377 implements MigrationInterface {
    name = 'AddExtracolumns1742438289377'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`shift\` DROP FOREIGN KEY \`FK_083625267fd25d0a07ed79f031f\``);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP FOREIGN KEY \`FK_8a1792520f70ef5df262bf9f0b4\``);
        await queryRunner.query(`ALTER TABLE \`shift\` CHANGE \`assignedUserId\` \`assignedUserId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`shift\` CHANGE \`createdById\` \`createdById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD CONSTRAINT \`FK_083625267fd25d0a07ed79f031f\` FOREIGN KEY (\`assignedUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD CONSTRAINT \`FK_8a1792520f70ef5df262bf9f0b4\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`shift\` DROP FOREIGN KEY \`FK_8a1792520f70ef5df262bf9f0b4\``);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP FOREIGN KEY \`FK_083625267fd25d0a07ed79f031f\``);
        await queryRunner.query(`ALTER TABLE \`shift\` CHANGE \`createdById\` \`createdById\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`shift\` CHANGE \`assignedUserId\` \`assignedUserId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD CONSTRAINT \`FK_8a1792520f70ef5df262bf9f0b4\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD CONSTRAINT \`FK_083625267fd25d0a07ed79f031f\` FOREIGN KEY (\`assignedUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
