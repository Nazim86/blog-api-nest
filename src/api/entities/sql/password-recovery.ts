import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'password_recovery' })
export class PasswordRecovery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar' })
  recoveryCode: string;

  @Column({ unique: true, type: 'timestamp without time zone' })
  recoveryCodeExpiration: Date;

  @OneToOne(() => User, (u) => u.passwordRecovery, { cascade: true })
  @JoinColumn()
  user: User;
}
