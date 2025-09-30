import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSetup1742435881418 implements MigrationInterface {
    name = 'InitialSetup1742435881418'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` varchar(255) NOT NULL DEFAULT 'user', UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`shift\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`startTime\` datetime NOT NULL, \`endTime\` datetime NOT NULL, \`assignedUserId\` int NULL, \`createdById\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD CONSTRAINT \`FK_083625267fd25d0a07ed79f031f\` FOREIGN KEY (\`assignedUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD CONSTRAINT \`FK_8a1792520f70ef5df262bf9f0b4\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`shift\` DROP FOREIGN KEY \`FK_8a1792520f70ef5df262bf9f0b4\``);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP FOREIGN KEY \`FK_083625267fd25d0a07ed79f031f\``);
        await queryRunner.query(`DROP TABLE \`shift\``);
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
    }

}
