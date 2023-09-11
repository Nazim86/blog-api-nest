import { Repository } from 'typeorm';
import { QuestionsEntity } from '../../entities/quiz/questionsEntity';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionQueryClass } from './type/questionQueryClass';
import { PublishedStatusEnum } from '../../../enums/publishedStatus-enum';

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

  async getQuestions(questionsQuery: QuestionQueryClass) {
    const query = new QuestionQueryClass(
      questionsQuery.bodySearchTerm,
      questionsQuery.publishedStatus,
      questionsQuery.sortBy,
      questionsQuery.sortDirection,
      questionsQuery.pageNumber,
      questionsQuery.pageSize,
    );

    const skipSize = query.skipSize;
    let publishedStatus = null;

    if (query.publishedStatus === PublishedStatusEnum.published) {
      publishedStatus = true;
    }

    if (query.publishedStatus === PublishedStatusEnum.notPublished) {
      publishedStatus = false;
    }

    const questions = await this.questionsRepo
      .createQueryBuilder('q')
      .where(
        `${
          publishedStatus === true || publishedStatus === false
            ? 'q.published = :publishedStatus'
            : 'q.published is not null'
        }`,
        { publishedStatus: publishedStatus },
      )
      .andWhere('q.body ilike :bodySearchTerm', {
        bodySearchTerm: `%${query.bodySearchTerm}%`,
      })
      .orderBy(`q.${query.sortBy}`, query.sortDirection)
      .limit(query.pageSize)
      .offset(skipSize)
      .getManyAndCount();

    const totalCount = questions[1];

    return {
      pagesCount: query.totalPages(totalCount),
      page: Number(query.pageNumber),
      pageSize: Number(query.pageSize),
      totalCount: Number(totalCount),
      items: questions[0],
    };
  }
}
