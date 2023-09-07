import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestionsEntity } from './questionsEntity';
import { AnswersEnum } from '../../../enums/answers-enum';
import { PlayersEntity } from './players.entity';

@Entity({ name: 'answers' })
export class AnswersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AnswersEnum })
  answerStatus: AnswersEnum;

  @Column({ type: 'varchar' })
  addedAt: string;

  @OneToOne(() => QuestionsEntity, (q) => q.playerAnswer)
  @JoinColumn()
  question: QuestionsEntity;

  @ManyToOne(() => PlayersEntity, (p) => p.answer)
  @JoinColumn()
  player: PlayersEntity;
}
