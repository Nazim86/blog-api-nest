import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AnswersEntity } from './answers.entity';
import { GamePairEntity } from './gamePair.entity';

@Entity({ name: 'questions' })
export class QuestionsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  body: string;

  @Column({ type: 'varchar', nullable: true, array: true })
  correctAnswers: string[];

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @Column({ type: 'varchar' })
  createdAt: string;

  @Column({ type: 'varchar', nullable: true })
  updatedAt: string;

  // @ManyToOne(() => PlayersEntity, { onDelete: 'CASCADE' })
  // @JoinColumn()
  // player: PlayersEntity;

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
