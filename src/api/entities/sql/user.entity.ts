import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserBanInfoEntity } from '../user.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar' })
  login: string;

  @Column({ unique: true, type: 'varchar' })
  email: string;

  @OneToOne(() => UserBanInfoEntity, (bI) => bI.userId, {})
  banInfo: UserBanInfoEntity;
}
