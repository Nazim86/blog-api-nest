import { Repository } from 'typeorm';
import { QuestionsEntity } from '../../entities/quiz/questionsEntity';
import { InjectRepository } from '@nestjs/typeorm';

export class QuizRepository {
  constructor(
    //private readonly dataSource: DataSource,
    @InjectRepository(QuestionsEntity)
    private readonly questionsRepo: Repository<QuestionsEntity>,
  ) {}

  async saveQuestion(question: QuestionsEntity) {
    return this.questionsRepo.save(question);
  }
}
