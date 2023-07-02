import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserBanInfoEntity } from '../user.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar' })
  login: string;

  @Column({ unique: true, type: 'varchar' })
  passwordHash: string;

  @Column({ unique: true, type: 'varchar' })
  email: string;

  @Column({ unique: true, type: 'varchar' })
  createdAt: string;

  @Column({ unique: true, type: 'varchar' })
  isConfirmed: string;

  @Column({ unique: true, type: 'varchar' })
  isBanned: string;

  @OneToOne(() => UserBanInfoEntity, (ub) => ub.userId, {})
  banInfo: UserBanInfoEntity;
}
