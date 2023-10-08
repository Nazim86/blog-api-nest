import { Repository } from 'typeorm';
import { QuestionsEntity } from '../../entities/quiz/questions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GamePairEntity } from '../../entities/quiz/gamePair.entity';
import { AnswersEntity } from '../../entities/quiz/answers.entity';
import { ResultCode } from '../../../exception-handler/result-code-enum';

export class QuizQueryRepository {
  constructor(
    @InjectRepository(GamePairEntity)
    private readonly gamePairRepo: Repository<GamePairEntity>,
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

  async getGamePairById(gameId: string, userId: string) {
    //console.log('userId:', userId, 'gameId:', gameId);
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
                .andWhere('q.published = true')
                .orderBy('q.createdAt', 'ASC');
            }, 'agg'),
        'questions',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('questionId',cast(agg."questionId" as varchar),
              'answerStatus',agg."answerStatus",'addedAt', to_char(
            agg."addedAt"::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')))`,
            )
            .from((qb) => {
              return qb
                .select(`a."questionId", a."answerStatus",a."addedAt"`)
                .from(AnswersEntity, 'a')
                .leftJoin('a.gamePairs', 'agp')
                .leftJoin('a.player', 'pl')
                .where('pl.id = gp.player1Id')
                .andWhere('agp.id = :gameId', { gameId })
                .orderBy('a.addedAt', 'ASC');
              // .andWhere('a.answerStatus = :answerStatus', {
              //   answerStatus: AnswersEnum.Correct,
              // });
            }, 'agg'),
        'player1Answers',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('questionId',cast(agg."questionId" as varchar),
              'answerStatus',agg."answerStatus",'addedAt',to_char(
            agg."addedAt"::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') ))`,
            )
            .from((qb) => {
              return qb
                .select(`a."questionId", a."answerStatus",a."addedAt"`)
                .from(AnswersEntity, 'a')
                .leftJoin('a.gamePairs', 'agp')
                .leftJoin('a.player', 'pl')
                .where('pl.id = gp.player2Id')
                .andWhere('agp.id = :gameId', { gameId })
                .orderBy('a.addedAt', 'ASC');
              // .andWhere('a.answerStatus = :answerStatus', {
              //   answerStatus: AnswersEnum.Correct,
              // });
            }, 'agg'),
        'player2Answers',
      )
      .leftJoinAndSelect('gp.player1', 'pl1')
      .leftJoinAndSelect('pl1.user', 'u1')
      .leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('pl2.user', 'u2')
      .leftJoinAndSelect('gp.questions', 'q')
      .leftJoinAndSelect('gp.answers', 'a')
      .where('gp.id = :gameId', { gameId })
      .getRawOne();

    console.log(gamePair);
    //writeSql(gamePair);

    if (!gamePair) return { code: ResultCode.NotFound };

    if (gamePair.u1_id !== userId && gamePair.u2_id !== userId)
      return { code: ResultCode.Forbidden };

    let secondPlayerProgress = null;

    if (gamePair.pl1_id && gamePair.pl2_id) {
      secondPlayerProgress = {
        answers: gamePair.player2Answers ?? [],
        player: {
          id: gamePair.u2_id,
          login: gamePair.u2_login,
        },
        score: gamePair.pl2_score,
      };
    }

    return {
      code: ResultCode.Success,
      data: {
        id: gamePair.gp_id,
        firstPlayerProgress: {
          answers: gamePair.player1Answers ?? [],
          player: {
            id: gamePair.u1_id,
            login: gamePair.u1_login,
          },
          score: gamePair.pl1_score,
        },
        secondPlayerProgress: secondPlayerProgress,
        questions: gamePair.questions,
        status: gamePair.gp_status,
        pairCreatedDate: gamePair.gp_pairCreatedDate,
        startGameDate: gamePair.gp_startGameDate,
        finishGameDate: gamePair.gp_finishGameDate,
      },
    };
  }
}
