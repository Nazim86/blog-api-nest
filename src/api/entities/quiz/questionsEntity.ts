import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AnswersEntity } from './answers.entity';
import { GamePairEntity } from './gamePair.entity';
import { Users } from '../users/user.entity';

@Entity({ name: 'questions' })
export class QuestionsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  body: string;

  @Column({ type: 'varchar', nullable: true, array: true })
  correctAnswers: string[];

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @Column({ type: 'varchar' })
  createdAt: string;

  @Column({ type: 'varchar', nullable: true })
  updatedAt: string;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn()
  player: Users;

  @OneToMany(() => AnswersEntity, (a) => a.question, { nullable: true })
  playerAnswer: AnswersEntity[];

  @ManyToMany(() => GamePairEntity, (gp) => gp.questions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable()
  gamePairs: GamePairEntity[];

  // @ManyToOne(() => GamePairEntity, (gp) => gp.question)
  // gamePair: GamePairEntity;
}
