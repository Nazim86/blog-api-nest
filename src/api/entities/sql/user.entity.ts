import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersBanBySA } from './users-ban-by-sa';
import { EmailConfirmation } from './email-confirmation';

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

  @OneToOne(() => UsersBanBySA, (ub) => ub.userId, {})
  banInfo: UsersBanBySA;

  @OneToOne(() => EmailConfirmation, (ec) => ec.userId)
  emailConfirmation: EmailConfirmation;
}
