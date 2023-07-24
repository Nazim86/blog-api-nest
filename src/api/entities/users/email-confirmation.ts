import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './user.entity';

@Entity({ name: 'email_confirmation' })
export class EmailConfirmation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar' })
  confirmationCode: string;

  @Column({ type: 'timestamp without time zone' })
  emailExpiration: Date;

  @OneToOne(() => Users, (u) => u.emailConfirmation, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Users;
}
