import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  email: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  employmentstartdate: Date;

  @Column({ nullable: true })
  employmentenddate: Date;

  @Column({ nullable: true })
  lastlogin: Date;

  // (RN, LPN, CNA)
  @Column({ nullable: true })
  team: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true })
  directmanager: string;

  @Column({ nullable: true })
  resetTokenExpiry: Date;

  @Column({ nullable: true })
  confirmationToken: string;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true })
  deletedby: string;

  @Column({ nullable: true })
  datecreated: Date;

  @Column({ nullable: true })
  active: Boolean;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}