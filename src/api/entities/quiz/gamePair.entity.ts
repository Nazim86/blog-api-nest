import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameStatusEnum } from '../../../enums/game-status-enum';
import { QuestionsEntity } from './questionsEntity';
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

  @OneToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn()
  player1: Users;

  @OneToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn()
  player2: Users;

  @ManyToMany(() => QuestionsEntity, (q) => q.gamePairs)
  questions: QuestionsEntity[];

  @ManyToMany(() => AnswersEntity, (a) => a.gamePairs)
  answers: AnswersEntity[];
}

// @Column({ type: 'number', default: 0 })
// player1Score;
//
// @Column({ type: 'number', default: 0 })
// player2Score;
