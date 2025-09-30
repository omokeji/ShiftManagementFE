import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable  } from 'typeorm';
import { User } from '../users/user.entity';
import { JobType } from '../job-types/job-types.entity';

@Entity()
export class Shift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  type: string;

  @Column()
  date: Date;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @ManyToOne(() => JobType, { eager: true })
  job: JobType;

  @Column()
  jobId: number;

  @Column()
  requiredSkills: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  maxEmployees: number;

  @Column({ default: 'open' })
  status: string;

  @Column({ nullable: true })
  breakDuration: number; // in minutes

  @ManyToMany(() => User)
  @JoinTable()
  users: User[];

  @Column('json', { nullable: true })
  clockRecords: { 
    userId: number; 
    clockIn: Date; 
    clockOut?: Date;
    note?: string;
  }[];

  @Column('json', { nullable: true })
  clockInChangeRequests: { userId: number; requestedClockIn: Date; approved?: boolean }[];
}