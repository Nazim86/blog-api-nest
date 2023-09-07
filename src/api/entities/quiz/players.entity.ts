import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GamePairEntity } from './gamePair.entity';
import { AnswersEntity } from './answers.entity';
import { Users } from '../users/user.entity';

@Entity({ name: 'players' })
export class PlayersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  createdAt: string;

  @Column({ type: 'integer' })
  score: number;

  @ManyToOne(() => GamePairEntity, (gm) => gm.player)
  @JoinColumn()
  gamePair: GamePairEntity;

  @OneToMany(() => AnswersEntity, (a) => a.player)
  answer: AnswersEntity;

  @OneToOne(() => Users, (u) => u.player)
  user: Users;
}
