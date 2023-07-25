import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './user.entity';

@Entity({ name: 'users_ban_by_sa' })
export class UsersBanBySa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean' })
  isBanned: boolean;

  @Column({ type: 'varchar', nullable: true })
  banDate: string;

  @Column({ type: 'varchar', nullable: true })
  banReason: string;

  @OneToOne(() => Users, (u) => u.banInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Users;
}
