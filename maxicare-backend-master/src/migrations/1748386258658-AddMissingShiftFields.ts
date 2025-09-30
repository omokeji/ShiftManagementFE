import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingShiftFields1748386258658 implements MigrationInterface {
    name = 'AddMissingShiftFields1748386258658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`title\` \`title\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`employmentstartdate\` \`employmentstartdate\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`employmentenddate\` \`employmentenddate\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`lastlogin\` \`lastlogin\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`team\` \`team\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`resetToken\` \`resetToken\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`directmanager\` \`directmanager\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`resetTokenExpiry\` \`resetTokenExpiry\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`confirmationToken\` \`confirmationToken\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`deletedby\` \`deletedby\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`datecreated\` \`datecreated\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`active\` \`active\` tinyint NULL`);
        await queryRunner.query(`ALTER TABLE \`shift\` CHANGE \`breakDuration\` \`breakDuration\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP COLUMN \`clockRecords\``);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD \`clockRecords\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP COLUMN \`clockInChangeRequests\``);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD \`clockInChangeRequests\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`job_type\` CHANGE \`description\` \`description\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`job_type\` CHANGE \`phone\` \`phone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`job_type\` CHANGE \`email\` \`email\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`job_type\` CHANGE \`colorcode\` \`colorcode\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`job_type\` CHANGE \`code\` \`code\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job_type\` CHANGE \`code\` \`code\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`job_type\` CHANGE \`colorcode\` \`colorcode\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`job_type\` CHANGE \`email\` \`email\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`job_type\` CHANGE \`phone\` \`phone\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`job_type\` CHANGE \`description\` \`description\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP COLUMN \`clockInChangeRequests\``);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD \`clockInChangeRequests\` longtext COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP COLUMN \`clockRecords\``);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD \`clockRecords\` longtext COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`shift\` CHANGE \`breakDuration\` \`breakDuration\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`active\` \`active\` tinyint NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`datecreated\` \`datecreated\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`deletedby\` \`deletedby\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`confirmationToken\` \`confirmationToken\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`resetTokenExpiry\` \`resetTokenExpiry\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`directmanager\` \`directmanager\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`resetToken\` \`resetToken\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`team\` \`team\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`lastlogin\` \`lastlogin\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`employmentenddate\` \`employmentenddate\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`employmentstartdate\` \`employmentstartdate\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`title\` \`title\` varchar(255) NULL DEFAULT 'NULL'`);
    }

}
