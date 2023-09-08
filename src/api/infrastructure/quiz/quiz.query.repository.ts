import { Repository } from 'typeorm';
import { QuestionsEntity } from '../../entities/quiz/questionsEntity';
import { InjectRepository } from '@nestjs/typeorm';

export class QuizQueryRepository {
  constructor(
    //private readonly dataSource: DataSource,
    @InjectRepository(QuestionsEntity)
    private readonly questionsRepo: Repository<QuestionsEntity>,
  ) {}

  async getQuestionById(id: string) {
    return this.questionsRepo
      .createQueryBuilder('q')
      .where('q.id = :id', { id: id })
      .getOne();
  }
}
