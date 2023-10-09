import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GamePairEntity } from '../../entities/quiz/gamePair.entity';
import { AnswersEntity } from '../../entities/quiz/answers.entity';
import { PlayersEntity } from '../../entities/quiz/players.entity';

export class QuizQueryRepository {
  constructor(
    @InjectRepository(PlayersEntity)
    private readonly playersRepo: Repository<PlayersEntity>,
    @InjectRepository(AnswersEntity)
    private readonly answersRepo: Repository<AnswersEntity>,
  ) {}

  async getAnswerById(answerId: string) {
    const answer = await this.answersRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.question', 'q')
      .where('a.id = :id', { id: answerId })
      .getOne();
    //console.log(answer);
    return {
      questionId: answer.question.id,
      answerStatus: answer.answerStatus,
      addedAt: answer.addedAt,
    };
  }

  async getMyStatistic(userId: string) {
    const myStatistic = await this.playersRepo
      .createQueryBuilder('p')
      .addSelect(
        (qb) =>
          qb
            .select(`sum(p.score)`)
            .from(PlayersEntity, 'p')
            .leftJoin('p.user', 'u')
            .where('u.id = :userId', { userId }),
        'sumScore',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(GamePairEntity, 'g')
            .leftJoin('g.player1', 'pl1')
            .leftJoin('pl1.user', 'u1')
            .leftJoin('g.player2', 'pl2')
            .leftJoin('pl2.user', 'u2')

            .where(
              '((u1.id = :userId and pl1.score > pl2.score ) or (u2.id = :userId and pl2.score >pl1.score))',
              { userId },
            ),
        'winsCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(GamePairEntity, 'g')
            .leftJoin('g.player1', 'pl1')
            .leftJoin('pl1.user', 'u1')
            .leftJoin('g.player2', 'pl2')
            .leftJoin('pl2.user', 'u2')

            .where(
              '((u1.id = :userId and pl1.score < pl2.score ) or (u2.id = :userId and pl2.score < pl1.score))',
              { userId },
            ),
        'lossesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(GamePairEntity, 'g')
            .leftJoin('g.player1', 'pl1')
            .leftJoin('pl1.user', 'u1')
            .leftJoin('g.player2', 'pl2')
            .leftJoin('pl2.user', 'u2')

            .where(
              '((u1.id = :userId and pl1.score = pl2.score ) or (u2.id = :userId and pl2.score = pl1.score))',
              { userId },
            ),
        'drawsCount',
      )
      .leftJoinAndSelect('p.user', 'u')
      .where('u.id = :userId', { userId })
      .getRawMany();

    const avgScores = Number(myStatistic[0].sumScore) / myStatistic.length;
    return {
      sumScore: Number(myStatistic[0].sumScore),
      avgScores: avgScores,
      gamesCount: myStatistic.length,
      winsCount: Number(myStatistic[0].winsCount),
      lossesCount: Number(myStatistic[0].lossesCount),
      drawsCount: Number(myStatistic[0].drawsCount),
    };
  }
}
