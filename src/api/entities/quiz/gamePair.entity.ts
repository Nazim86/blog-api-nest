import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameStatusEnum } from '../../../enums/game-status-enum';
import { QuestionsEntity } from './questions.entity';
import { Users } from '../users/user.entity';
import { AnswersEntity } from './answers.entity';

@Entity({ name: 'game_pair' })
export class GamePairEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  pairCreatedDate: string;

  @Column({ type: 'varchar', nullable: true })
  startGameDate: string;

  @Column({ type: 'varchar', nullable: true })
  finishGameDate: string;

  @Column({ type: 'enum', enum: GameStatusEnum })
  status: GameStatusEnum;

  @ManyToOne(() => Users, (u) => u.games1)
  @JoinColumn()
  player1: Users;

  @ManyToOne(() => Users, (u) => u.games2)
  @JoinColumn()
  player2: Users;

  @ManyToMany(() => QuestionsEntity, (q) => q.gamePairs)
  questions: QuestionsEntity[];

  @ManyToMany(() => AnswersEntity, (a) => a.gamePairs)
  answers: AnswersEntity[];
}
