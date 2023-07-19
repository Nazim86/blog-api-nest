import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user.entity';

@Entity({ name: 'email_confirmation' })
export class EmailConfirmation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (u) => u.emailConfirmation, { cascade: true })
  @JoinColumn({ name: 'userId' })
  userId: string;

  @Column({ unique: true, type: 'varchar' })
  confirmationCode: string;

  @Column({ unique: true, type: 'datetime' })
  emailExpiration: Date;
}
