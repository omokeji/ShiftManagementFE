import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class JobType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column('json')
  location: {
    lat: number;
    lon: number;
    radius: number;
    address?: string;
  };

  @Column({ nullable: true })
  colorcode: string;

  @Column({ nullable: true })
  code: string;
}