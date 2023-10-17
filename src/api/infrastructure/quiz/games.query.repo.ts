import { Injectable } from '@nestjs/common';
import { Pagination, PaginationType } from '../../../common/pagination';
import { InjectRepository } from '@nestjs/typeorm';
import { GamePairEntity } from '../../entities/quiz/gamePair.entity';
import { Repository } from 'typeorm';
import { AnswersEntity } from '../../entities/quiz/answers.entity';
import { QuestionsEntity } from '../../entities/quiz/questions.entity';
import { GameQuery } from '../../../common/gameQuery';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { GameStatusEnum } from '../../../enums/game-status-enum';

@Injectable()
export class GamesQueryRepo {
  constructor(
    @InjectRepository(GamePairEntity)
    private readonly gamesRepo: Repository<GamePairEntity>,
  ) {}

  private mappingMyGames(games) {
    return games.map((game) => {
      return {
        id: game.gp_id,
        firstPlayerProgress: {
          answers: game.player1Answers ?? [],
          player: {
            id: game.u1_id,
            login: game.u1_login,
          },
          score: game.pl1_score,
        },
        secondPlayerProgress: {
          answers: game.player2Answers ?? [],
          player: {
            id: game.u2_id,
            login: game.u2_login,
          },
          score: game.pl2_score,
        },
        questions: game.questions,
        status: game.gp_status,
        pairCreatedDate: game.gp_pairCreatedDate,
        startGameDate: game.gp_startGameDate,
        finishGameDate: game.gp_finishGameDate,
      };
    });
  }

  // private answerMapping(answers: AnswersEntity[]) {
  //   return answers.map((answer) => {
  //     return {
  //       questionId: answer.question.id,
  //       answerStatus: answer.answerStatus,
  //       addedAt: answer.addedAt,
  //     };
  //   });
  // }

  async getAllMyGames(query: Pagination<PaginationType>, userId: string) {
    const paginatedQuery = new GameQuery(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
    );

    // let sortBy = null;
    //
    // if (sortBy !== paginatedQuery.sortBy) {
    //   sortBy = paginatedQuery.sortBy;
    // } else {
    //   sortBy = 'pairCreatedDate';
    // }

    console.log(paginatedQuery.sortBy);
    const skipSize = paginatedQuery.skipSize;

    const games = await this.gamesRepo
      .createQueryBuilder('gp')
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(GamePairEntity, 'gp')
            .leftJoin('gp.player1', 'pl1')
            .leftJoin('pl1.user', 'u1')
            .leftJoin('gp.player2', 'pl2')
            .leftJoin('pl2.user', 'u2')
            .where('(u1.id = :userId or u2.id = :userId)', { userId }),
        'totalCount',
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
              return (
                qb
                  .select(`a."questionId", a."answerStatus",a."addedAt"`)
                  .from(AnswersEntity, 'a')
                  .leftJoin('a.gamePairs', 'agp')
                  .leftJoin('a.player', 'pl')
                  .leftJoin('pl.user', 'u')
                  .where('u.id = :userId', { userId })
                  //.andWhere('agp.status = gp.status')
                  .andWhere('agp.id = gp.id')
                  .orderBy('a.addedAt', 'ASC')
              );
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
              return (
                qb
                  .select(`a."questionId", a."answerStatus",a."addedAt"`)
                  .from(AnswersEntity, 'a')
                  .leftJoin('a.gamePairs', 'agp')
                  .leftJoin('a.player', 'pl')
                  .leftJoin('pl.user', 'u')
                  .where('u.id = :userId', { userId })
                  //.andWhere('agp.status = gp.status')
                  .andWhere('agp.id = gp.id')
                  .orderBy('a.addedAt', 'ASC')
              );
            }, 'agg'),
        'player2Answers',
      )
      .leftJoinAndSelect('gp.player1', 'pl1')
      .leftJoinAndSelect('pl1.user', 'u1')
      .leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('pl2.user', 'u2')
      .where('(u1.id = :userId or u2.id = :userId)', { userId })
      .andWhere('(gp.status = :statusFinished or gp.status = :statusActive)', {
        statusFinished: GameStatusEnum.Finished,
        statusActive: GameStatusEnum.Active,
      })
      .orderBy(`gp.${paginatedQuery.sortBy}`, paginatedQuery.sortDirection)
      .addOrderBy('gp.pairCreatedDate', 'DESC')
      .limit(paginatedQuery.pageSize)
      .offset(skipSize)
      .getRawMany();

    console.log(games);
    // console.log(games[0].player1Answers);
    // console.log(games[1].player1Answers);

    const totalCount = Number(games[0].totalCount);

    const pagesCount = paginatedQuery.totalPages(totalCount);

    const mappedGames = await this.mappingMyGames(games);

    return {
      pagesCount: pagesCount,
      page: Number(paginatedQuery.pageNumber),
      pageSize: Number(paginatedQuery.pageSize),
      totalCount: totalCount,
      items: mappedGames,
    };
  }

  async getGamePairById(gameId: string, userId: string) {
    //console.log('userId:', userId, 'gameId:', gameId);
    const gamePair = await this.gamesRepo
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

    //console.log(gamePair);
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
