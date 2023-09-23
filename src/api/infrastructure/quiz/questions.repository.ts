import { Repository } from 'typeorm';
import { QuestionsEntity } from '../../entities/quiz/questions.entity';
import { InjectRepository } from '@nestjs/typeorm';

export class QuestionsRepository {
  constructor(
    //private readonly dataSource: DataSource,
    @InjectRepository(QuestionsEntity)
    private readonly questionsRepo: Repository<QuestionsEntity>,
  ) {}

  async saveQuestion(question: QuestionsEntity): Promise<QuestionsEntity> {
    return this.questionsRepo.save(question);
  }

  async getQuestionById(id: string): Promise<QuestionsEntity> {
    return this.questionsRepo
      .createQueryBuilder('q')
      .where('q.id = :id', { id: id })
      .getOne();
  }

  async getRandomQuestions(count: number): Promise<QuestionsEntity[]> {
    return this.questionsRepo
      .createQueryBuilder()
      .where('published = true')
      .orderBy('RANDOM()') // Use RANDOM() for PostgreSQL
      .limit(count)
      .getMany();
  }

  async deleteQuestionById(id: string): Promise<boolean> {
    const isDeleted = await this.questionsRepo
      .createQueryBuilder()
      .delete()
      .from(QuestionsEntity)
      .where('id = :id', { id: id })
      .execute();

    return isDeleted.affected === 1;
  }

  // async getQuestionsByGamePairAndUserId(
  //   gamePairId: string,
  //   userId: string,
  // ): Promise<QuestionsEntity[]> {
  //   return this.questionsRepo
  //     .createQueryBuilder('q')
  //     .leftJoinAndSelect('q.gamePairs', 'gp')
  //     .leftJoinAndSelect('gp.answers', 'a')
  //     .leftJoinAndSelect('a.player', 'pl')
  //     .where('gp.id = :gamePairId', { gamePairId: gamePairId })
  //     .andWhere('pl.id = :userId', { userId: userId })
  //     .getRawMany();
  // }
}
