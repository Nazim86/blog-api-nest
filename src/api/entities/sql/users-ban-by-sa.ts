import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'users_ban_by_sa' })
export class UsersBanBySA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean' })
  isBanned: string;

  @Column({ type: 'varchar' })
  banDate: string;

  @Column({ type: 'varchar' })
  banReason: string;

  @OneToOne(() => User, (u) => u.banInfo, { cascade: true })
  @JoinColumn()
  user: User;
}
