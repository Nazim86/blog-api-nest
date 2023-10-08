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
import { AnswersEntity } from './answers.entity';
import { PlayersEntity } from './players.entity';

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

  @ManyToOne(() => PlayersEntity)
  @JoinColumn()
  player1: PlayersEntity;

  @ManyToOne(() => PlayersEntity)
  @JoinColumn()
  player2: PlayersEntity;

  @ManyToMany(() => QuestionsEntity, (q) => q.gamePairs)
  questions: QuestionsEntity[];

  @ManyToMany(() => AnswersEntity, (a) => a.gamePairs)
  answers: AnswersEntity[];

  // @OneToMany(() => PlayersEntity, (pls) => pls.gamePair)
  // playerScore: PlayersEntity;
}
