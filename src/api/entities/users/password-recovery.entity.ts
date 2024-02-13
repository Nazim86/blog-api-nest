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

  // @PrimaryColumn()
  // @OneToOne(() => Users, (u) => u.passwordRecovery, { onDelete: 'CASCADE' })
  // @JoinColumn()
  // userId: string;

  @Column({ unique: true, type: 'varchar', nullable: true })
  recoveryCode: string;

  @Column({ type: 'timestamp without time zone', nullable: true })
  recoveryCodeExpiration: Date;

  @OneToOne(() => Users, (u) => u.passwordRecovery, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Users;
}
