import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnswersEntity } from './answers.entity';
import { Users } from '../users/user.entity';

@Entity({ name: 'players' })
export class PlayersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  createdAt: string;

  @Column({ type: 'integer', default: 0 })
  score: number;

  // @OneToOne(() => GamePairEntity, (gm) => gm.player)
  // @JoinColumn()
  // gamePair: GamePairEntity;

  @OneToMany(() => AnswersEntity, (a) => a.player)
  answer: AnswersEntity;

  @OneToOne(() => Users, (u) => u.player)
  user: Users;
}
