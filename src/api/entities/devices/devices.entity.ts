import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../users/user.entity';

@Entity()
export class Devices {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  lastActiveDate: string;

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  expiration: string;

  // @Column({ type: String, required: true })
  // deviceId: string;

  @ManyToOne(() => Users, (u) => u.device, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Users;
}
