import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { AnswersEntity } from './answers.entity';

@Entity({ name: 'questions' })
export class QuestionsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  body: string;

  @Column({ type: 'varchar', nullable: true })
  correctAnswers: string[];

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @Column({ type: 'varchar' })
  createdAt: string;

  @Column({ type: 'varchar', nullable: true })
  updatedAt: string;

  @OneToOne(() => AnswersEntity, (a) => a.question, { nullable: true })
  playerAnswer: AnswersEntity;
}
