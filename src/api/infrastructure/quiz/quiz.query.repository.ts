import { Repository } from 'typeorm';
import { QuestionsEntity } from '../../entities/quiz/questions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GamePairEntity } from '../../entities/quiz/gamePair.entity';
import { AnswersEntity } from '../../entities/quiz/answers.entity';
import { AnswersEnum } from '../../../enums/answers-enum';
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
      .addSelect((qb) =>
        qb
          .select(`count(*)`, 'pl1Score')
          .from(AnswersEntity, 'a')
          .leftJoin('a.gamePairs', 'gp')
          .leftJoin('gp.player1', 'pl1')
          .leftJoin('a.player', 'apl')
          .where('gp.id = :gameId', { gameId })
          .andWhere('apl.id = pl1.id')
          .andWhere('a.answerStatus = :answerStatus', {
            answerStatus: AnswersEnum.Correct,
          }),
      )
      .addSelect((qb) =>
        qb
          .select(`count(*)`, 'pl2Score')
          .from(AnswersEntity, 'a')
          .leftJoin('a.gamePairs', 'gp')
          .leftJoin('gp.player2', 'pl2')
          .leftJoin('a.player', 'apl')
          .where('gp.id = :gameId', { gameId })
          .andWhere('apl.id = pl2.id')
          .andWhere('a.answerStatus = :answerStatus', {
            answerStatus: AnswersEnum.Correct,
          }),
      )
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
      .leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('gp.questions', 'q')
      .leftJoinAndSelect('gp.answers', 'a')
      .where('gp.id = :gameId', { gameId })
      .getRawOne();

    console.log(gamePair);
    //writeSql(gamePair);

    if (!gamePair) return { code: ResultCode.NotFound };

    if (gamePair.pl1_id !== userId && gamePair.pl2_id !== userId)
      return { code: ResultCode.Forbidden };

    let player1Score = Number(gamePair.pl1Score);
    let player2Score = Number(gamePair.pl2Score);
    let secondPlayerProgress = null;

    console.log(gamePair.pl1DateSum, gamePair.pl2DateSum);

    if (
      gamePair.player1Answers &&
      gamePair.player2Answers &&
      gamePair.player1Answers.length === 5 &&
      gamePair.player2Answers.length === 5
    ) {
      if (
        gamePair.player1Answers[4].addedAt < gamePair.player2Answers[4].addedAt
      ) {
        player1Score += 1;
      } else {
        player2Score += 1;
      }
    }

    if (gamePair.pl1_id && gamePair.pl2_id) {
      secondPlayerProgress = {
        answers: gamePair.player2Answers ?? [],
        player: {
          id: gamePair.pl2_id,
          login: gamePair.pl2_login,
        },
        score: player2Score,
      };
    }

    return {
      code: ResultCode.Success,
      data: {
        id: gamePair.gp_id,
        firstPlayerProgress: {
          answers: gamePair.player1Answers ?? [],
          player: {
            id: gamePair.pl1_id,
            login: gamePair.pl1_login,
          },
          score: player1Score,
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
