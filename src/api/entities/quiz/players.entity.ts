import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../users/user.entity';
import { GamePairEntity } from './gamePair.entity';
import { AnswersEntity } from './answers.entity';

@Entity({ name: 'players' })
export class PlayersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 0 })
  score: number;

  @ManyToOne(() => Users, (u) => u.player, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Users;

  @ManyToOne(() => GamePairEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  gamePair: GamePairEntity;

  @OneToMany(() => AnswersEntity, (a) => a.player)
  answers: AnswersEntity[];
}
