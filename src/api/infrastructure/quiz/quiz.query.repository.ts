import { Repository } from 'typeorm';
import { QuestionsEntity } from '../../entities/quiz/questionsEntity';
import { InjectRepository } from '@nestjs/typeorm';
import { GamePairEntity } from '../../entities/quiz/gamePair.entity';
import { GameStatusEnum } from '../../../enums/game-status-enum';
import { AnswersEntity } from '../../entities/quiz/answers.entity';
import { AnswersEnum } from '../../../enums/answers-enum';

export class QuizQueryRepository {
  constructor(
    //private readonly dataSource: DataSource,
    @InjectRepository(GamePairEntity)
    private readonly gamePairRepo: Repository<GamePairEntity>,
  ) {}

  // async savePlayer(player: PlayersEntity) {
  //   return this.playersRepo.save(player);
  // }

  async saveGamePair(gamePair: GamePairEntity): Promise<GamePairEntity> {
    return this.gamePairRepo.save(gamePair);
  }

  // async getPlayerByUserId(userId: string) {
  //   return this.playersRepo
  //     .createQueryBuilder('p')
  //     .leftJoinAndSelect('p.gamePair', 'gp')
  //     .leftJoinAndSelect('p.answer', 'a')
  //     .leftJoinAndSelect('p.user', 'u')
  //     .where('u.id = :userId', { userId: userId })
  //     .getOne();
  // }

  async getGamePairByUserId(userId: string): Promise<GamePairEntity> {
    return this.gamePairRepo
      .createQueryBuilder('gp')
      .leftJoinAndSelect('gp.player1', 'pl1')
      .leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('gp.questions', 'q')
      .where('pl1.id = :userId', { userId: userId })
      .orWhere('pl2.id = :userId', { userId: userId })
      .getOne();
  }
  async getGamePairByStatus(status: GameStatusEnum): Promise<GamePairEntity> {
    return this.gamePairRepo
      .createQueryBuilder('gp')
      .leftJoinAndSelect('gp.player1', 'pl1')
      .leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('gp.questions', 'q')
      .where('gp.status = :status', { status: status })
      .getOne();
  }

  async getGamePairById(id: string) {
    const gamePair = await this.gamePairRepo
      .createQueryBuilder('gp')
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('id',cast(agg.id as varchar),
            'body', agg.body))`,
            )
            .from((qb) => {
              return qb
                .select(`q.id, q.body`)
                .from(QuestionsEntity, 'q')
                .leftJoin('q.gamePairs', 'qgp')
                .where('qgp.id = gp.id')
                .andWhere('q.published = true');
            }, 'agg'),
        'questions',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('questionId',cast(agg."questionId" as varchar),
              'answerStatus',agg."answerStatus",'addedAt', agg."addedAt"))`,
            )
            .from((qb) => {
              return qb
                .select(`a."questionId", a."answerStatus",a."addedAt"`)
                .from(AnswersEntity, 'a')
                .leftJoin('a.gamePairs', 'agp')
                .leftJoin('agp.player1', 'pl1')
                .where('pl1.id = gp.player1Id')
                .andWhere('agp.id = gp.id')
                .andWhere('a.answerStatus = :answerStatus', {
                  answerStatus: AnswersEnum.Correct,
                });
            }, 'agg'),
        'player1Answers',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('questionId',cast(agg."questionId" as varchar),
              'answerStatus',agg."answerStatus",'addedAt', agg."addedAt"))`,
            )
            .from((qb) => {
              return qb
                .select(`a."questionId", a."answerStatus",a."addedAt"`)
                .from(AnswersEntity, 'a')
                .leftJoin('a.gamePairs', 'agp')
                .leftJoin('agp.player2', 'pl2')
                .where('pl2.id = gp.player2Id')
                .andWhere('agp.id = gp.id')
                .andWhere('a.answerStatus = :answerStatus', {
                  answerStatus: AnswersEnum.Correct,
                });
            }, 'agg'),
        'player2Answers',
      )
      .leftJoinAndSelect('gp.player1', 'pl1')
      .leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('gp.questions', 'q')
      .leftJoinAndSelect(
        'gp.answers',
        'pl1Answer',
        'pl1Answer.playerId = pl1.id',
      )
      // .where('a.playerId = pl1')
      //.leftJoinAndSelect('a.player', 'pa1' as 'pl1Answer', 'pa1.id = pl1.id')
      //.leftJoinAndSelect('a.player', 'pa2' as 'pl2Answer', 'pa2.id = pl2.id')

      .where('gp.id = :id', { id: id })
      //.getSql();
      .getRawOne();

    //writeSql(gamePair);
    //console.log(gamePair);

    return {
      id: gamePair.gp_id,
      firstPlayerProgress: {
        answers: gamePair.player1Answers,
        player: {
          id: gamePair.pl1_id,
          login: gamePair.pl1_login,
        },
        score: gamePair.pl1Answer_score,
      },
      secondPlayerProgress: {
        answers: gamePair.player2Answers,
        player: {
          id: gamePair.pl2_id,
          login: gamePair.pl2_login,
        },
        score: gamePair.pl2Answer_score,
      },
      questions: gamePair.questions,
      status: gamePair.gp_status,
      pairCreatedDate: gamePair.gp_pairCreatedDate,
      startGameDate: gamePair.gp_startGameDate,
      finishGameDate: gamePair.gp_finishGameDate,
    };
  }
}
