import { Repository } from 'typeorm';
import { QuestionsEntity } from '../../entities/quiz/questionsEntity';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayersEntity } from '../../entities/quiz/players.entity';

export class QuizRepository {
  constructor(
    //private readonly dataSource: DataSource,
    @InjectRepository(PlayersEntity)
    private readonly questionsRepo: Repository<QuestionsEntity>,
    private readonly playersRepo: Repository<PlayersEntity>,
  ) {}

  async savePlayer(player: PlayersEntity) {
    return this.playersRepo.save(player);
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
