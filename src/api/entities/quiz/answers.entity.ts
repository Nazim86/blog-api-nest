import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestionsEntity } from './questions.entity';
import { AnswersEnum } from '../../../enums/answers-enum';
import { GamePairEntity } from './gamePair.entity';
import { PlayersEntity } from './players.entity';

@Entity({ name: 'answers' })
export class AnswersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AnswersEnum })
  answerStatus: AnswersEnum;

  @Column({ type: 'timestamptz', nullable: true })
  addedAt: Date;

  @ManyToOne(() => QuestionsEntity, (q) => q.playerAnswer, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  question: QuestionsEntity;

  @ManyToOne(() => PlayersEntity, (pl) => pl.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  player: PlayersEntity;

  @ManyToMany(() => GamePairEntity, (gp) => gp.answers, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  gamePairs: GamePairEntity;
}
