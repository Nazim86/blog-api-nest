import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
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

  @ManyToOne(() => QuestionsEntity, (q) => q.playerAnswer)
  @JoinColumn()
  question: QuestionsEntity;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn()
  player: Users;

  @Column({ type: 'integer', default: 0 })
  score: number;

  // @Column({ type: 'varchar', nullable: true })
  // playerAnswers: string[];

  @ManyToMany(() => GamePairEntity, (gp) => gp.answers, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  gamePairs: GamePairEntity;
}
