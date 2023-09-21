// import {
//   Column,
//   Entity,
//   ManyToMany,
//   OneToMany,
//   OneToOne,
//   PrimaryGeneratedColumn,
// } from 'typeorm';
// import { AnswersEntity } from './answers.entity';
// import { Users } from '../users/user.entity';
// import { GamePairEntity } from './gamePair.entity';
// import { QuestionsEntity } from './questionsEntity';
// import { QuestionsRepository } from '../../infrastructure/quiz/questions.repository';
//
// @Entity({ name: 'players' })
// export class PlayersEntity {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;
//
//   @Column({ type: 'varchar' })
//   createdAt: string;
//
//   @OneToMany(() => AnswersEntity, (a) => a.player)
//   answers: AnswersEntity[];
//
//   @OneToOne(() => Users, (u) => u.player)
//   user: Users;
//
//   @OneToOne(() => GamePairEntity)
//   gamePair: GamePairEntity;
//
//   @OneToMany(() => QuestionsEntity, (q) => q.player)
//   questions: QuestionsEntity[];
// }
//
//
