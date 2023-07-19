import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user.entity';

@Entity({ name: 'users_ban_by_sa' })
export class UsersBanBySA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'boolean' })
  isBanned: string;

  @Column({ unique: true, type: 'varchar' })
  banDate: string;

  @Column({ unique: true, type: 'varchar' })
  banReason: string;

  @OneToOne(() => User, (u) => u.banInfo, { cascade: true })
  @JoinColumn({ name: 'userId' })
  userId: string;
}
