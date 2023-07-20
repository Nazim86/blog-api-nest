import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersBanBySA } from './users-ban-by-sa';
import { EmailConfirmation } from './email-confirmation';
import { PasswordRecovery } from './password-recovery';

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

  @Column({ type: 'varchar' })
  createdAt: string;

  @Column({ type: 'varchar' })
  isConfirmed: string;

  @OneToOne(() => UsersBanBySA, (ub) => ub.user, {})
  banInfo: UsersBanBySA;

  @OneToOne(() => EmailConfirmation, (ec) => ec.user, {})
  emailConfirmation: EmailConfirmation;

  @OneToOne(() => PasswordRecovery, (pr) => pr.user, {})
  passwordRecovery: PasswordRecovery;
}
