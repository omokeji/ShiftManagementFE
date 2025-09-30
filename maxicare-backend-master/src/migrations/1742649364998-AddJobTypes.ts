import { MigrationInterface, QueryRunner } from "typeorm";

export class AddJobTypes1742649364998 implements MigrationInterface {
    name = 'AddJobTypes1742649364998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`employmentstartdate\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`employmentenddate\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`lastlogin\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`team\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`directmanager\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`isDeleted\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`deletedby\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`datecreated\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`active\` tinyint NULL`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD \`breakDuration\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD \`date\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD \`slots\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD \`clockRecords\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD \`clockInChangeRequests\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD \`jobTypeId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`title\` \`title\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`resetToken\` \`resetToken\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`resetTokenExpiry\` \`resetTokenExpiry\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`confirmationToken\` \`confirmationToken\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`job_type\` CHANGE \`description\` \`description\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`job_type\` CHANGE \`colorcode\` \`colorcode\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`job_type\` CHANGE \`code\` \`code\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD CONSTRAINT \`FK_66e72f573ae42fb0abc764a6c57\` FOREIGN KEY (\`jobTypeId\`) REFERENCES \`job_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`shift_users_user\` ADD CONSTRAINT \`FK_99431626b3c0786cf0b0bd3002e\` FOREIGN KEY (\`shiftId\`) REFERENCES \`shift\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`shift_users_user\` ADD CONSTRAINT \`FK_29680d04674054750133900e276\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`shift_users_user\` DROP FOREIGN KEY \`FK_29680d04674054750133900e276\``);
        await queryRunner.query(`ALTER TABLE \`shift_users_user\` DROP FOREIGN KEY \`FK_99431626b3c0786cf0b0bd3002e\``);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP FOREIGN KEY \`FK_66e72f573ae42fb0abc764a6c57\``);
        await queryRunner.query(`ALTER TABLE \`job_type\` CHANGE \`code\` \`code\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`job_type\` CHANGE \`colorcode\` \`colorcode\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`job_type\` CHANGE \`description\` \`description\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`confirmationToken\` \`confirmationToken\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`resetTokenExpiry\` \`resetTokenExpiry\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`resetToken\` \`resetToken\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`title\` \`title\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP COLUMN \`jobTypeId\``);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP COLUMN \`clockInChangeRequests\``);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP COLUMN \`clockRecords\``);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP COLUMN \`slots\``);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP COLUMN \`date\``);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP COLUMN \`breakDuration\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`active\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`datecreated\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`deletedby\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`isDeleted\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`directmanager\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`team\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`lastlogin\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`employmentenddate\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`employmentstartdate\``);
    }

}
