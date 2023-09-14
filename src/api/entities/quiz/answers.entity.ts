import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestionsEntity } from './questionsEntity';
import { AnswersEnum } from '../../../enums/answers-enum';
import { Users } from '../users/user.entity';
import { GamePairEntity } from './gamePair.entity';

@Entity({ name: 'answers' })
export class AnswersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AnswersEnum })
  answerStatus: AnswersEnum;

  @Column({ type: 'varchar', nullable: true })
  addedAt: string;

  @OneToOne(() => QuestionsEntity, (q) => q.playerAnswer)
  @JoinColumn()
  question: QuestionsEntity;

  @ManyToOne(() => Users)
  @JoinColumn()
  player: Users;

  @Column({ type: 'integer', default: 0 })
  score: number;

  @ManyToMany(() => GamePairEntity, (gp) => gp.answers)
  @JoinTable()
  gamePairs: GamePairEntity;
}
