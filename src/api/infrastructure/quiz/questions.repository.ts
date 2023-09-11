import { Repository } from 'typeorm';
import { QuestionsEntity } from '../../entities/quiz/questionsEntity';
import { InjectRepository } from '@nestjs/typeorm';

export class QuestionsRepository {
  constructor(
    //private readonly dataSource: DataSource,
    @InjectRepository(QuestionsEntity)
    private readonly questionsRepo: Repository<QuestionsEntity>,
  ) {}

  async saveQuestion(question: QuestionsEntity) {
    return this.questionsRepo.save(question);
  }

  async getQuestionById(id: string) {
    return this.questionsRepo
      .createQueryBuilder('q')
      .where('q.id = :id', { id: id })
      .getOne();
  }

  async deleteQuestionById(id: string) {
    const isDeleted = await this.questionsRepo
      .createQueryBuilder()
      .delete()
      .from(QuestionsEntity)
      .where('id = :id', { id: id })
      .execute();

    return isDeleted.affected === 1;
  }
}
