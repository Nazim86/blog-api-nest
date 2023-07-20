import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'email_confirmation' })
export class EmailConfirmation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar' })
  confirmationCode: string;

  @Column({ unique: true, type: 'timestamp without time zone' })
  emailExpiration: Date;

  @OneToOne(() => User, (u) => u.emailConfirmation, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
