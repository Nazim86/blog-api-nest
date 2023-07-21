import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './user.entity';

@Entity({ name: 'password_recovery' })
export class PasswordRecovery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar' })
  recoveryCode: string;

  @Column({ unique: true, type: 'timestamp without time zone' })
  recoveryCodeExpiration: Date;

  @OneToOne(() => Users, (u) => u.passwordRecovery, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Users;
}
