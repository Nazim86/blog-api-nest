import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GamePairEntity } from '../../entities/quiz/gamePair.entity';
import { AnswersEntity } from '../../entities/quiz/answers.entity';
import { PlayersEntity } from '../../entities/quiz/players.entity';
import { Users } from '../../entities/users/user.entity';
import { TopUsersQuery } from '../../../common/topUsersQuery';
import { SortDirection } from '../../../enums/sort-direction.enum';

export class QuizQueryRepository {
  constructor(
    @InjectRepository(PlayersEntity)
    private readonly playersRepo: Repository<PlayersEntity>,
    @InjectRepository(AnswersEntity)
    private readonly answersRepo: Repository<AnswersEntity>,
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>,
  ) {}

  private topUsersMapping(topUsers) {
    return topUsers.map((user) => {
      //const avgScores = Number(user.sumScore) / topUsers.length;

      return {
        sumScore: Number(user.sumScore),
        avgScores: user.avgScores, //Math.round(avgScores * 100) / 100,
        gamesCount: user.gamesCount,
        winsCount: Number(user.winsCount),
        lossesCount: Number(user.lossesCount),
        drawsCount: Number(user.drawsCount),
        player: {
          id: user.u_id,
          login: user.u_login,
        },
      };
    });
  }

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
            .select(`round(avg(p.score),2)`)
            .from(PlayersEntity, 'p')
            .leftJoin('p.user', 'plu')
            .where('plu.id = u.id'),
        //.where('u.id = :userId', { userId }),
        'avgScores',
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

    // console.log(myStatistic);

    // const avgScores = Number(myStatistic[0].sumScore) / myStatistic.length;
    return {
      sumScore: Number(myStatistic[0].sumScore),
      avgScores: myStatistic[0].avgScores, //Math.round(avgScores * 100) / 100,
      gamesCount: myStatistic.length,
      winsCount: Number(myStatistic[0].winsCount),
      lossesCount: Number(myStatistic[0].lossesCount),
      drawsCount: Number(myStatistic[0].drawsCount),
    };
  }

  async getTopUsers(query) {
    const paginatedQuery = new TopUsersQuery(
      query.sort,
      query.pageNumber,
      query.pageSize,
    );

    // const sortArray = paginatedQuery.sort;
    // const sortObject = {};
    //
    // for (const item of sortArray) {
    //   const [key, value] = item.split(' ');
    //   sortObject[key] = value.toUpperCase();
    // }
    //
    // const sortJson = JSON.stringify(sortObject);
    //
    // console.log(sortJson);

    const skipSize = paginatedQuery.skipSize;

    const queryBuilder = this.playersRepo
      .createQueryBuilder('p')
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(PlayersEntity, 'p')
            .leftJoin('p.user', 'plu')
            .where('plu.id = u.id'),
        //.where('u.id = :userId', { userId }),
        'totalCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`sum(p.score)`)
            .from(PlayersEntity, 'p')
            .leftJoin('p.user', 'plu')
            .where('plu.id = u.id'),
        //.where('u.id = :userId', { userId }),
        'sumScore',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`round(avg(p.score),2)`)
            .from(PlayersEntity, 'p')
            .leftJoin('p.user', 'plu')
            .where('plu.id = u.id'),
        //.where('u.id = :userId', { userId }),
        'avgScores',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(PlayersEntity, 'p')
            .leftJoin('p.user', 'plu')
            .where('plu.id = u.id'),
        //.where('u.id = :userId', { userId }),
        'gamesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(GamePairEntity, 'g')
            .leftJoin('g.player1', 'pl1')
            .leftJoin('pl1.user', 'plu1')
            .leftJoin('g.player2', 'pl2')
            .leftJoin('pl2.user', 'plu2')
            .where(
              '((plu1.id = u.id and pl1.score > pl2.score ) or (plu2.id = u.id and pl2.score >pl1.score))',
            ),
        // .where(
        //   '((u1.id = :userId and pl1.score > pl2.score ) or (u2.id = :userId and pl2.score >pl1.score))',
        //   { userId },
        // ),
        'winsCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(GamePairEntity, 'g')
            .leftJoin('g.player1', 'pl1')
            .leftJoin('pl1.user', 'plu1')
            .leftJoin('g.player2', 'pl2')
            .leftJoin('pl2.user', 'plu2')
            .where(
              '((plu1.id = u.id and pl1.score < pl2.score ) or (plu2.id = u.id and pl2.score < pl1.score))',
            ),

        // .where(
        //   '((u1.id = :userId and pl1.score < pl2.score ) or (u2.id = :userId and pl2.score < pl1.score))',
        //   { userId },
        // ),
        'lossesCount',
      )

      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(GamePairEntity, 'g')
            .leftJoin('g.player1', 'pl1')
            .leftJoin('pl1.user', 'plu1')
            .leftJoin('g.player2', 'pl2')
            .leftJoin('pl2.user', 'plu2')
            .where(
              '((plu1.id = u.id and pl1.score = pl2.score ) or (plu2.id = u.id and pl2.score = pl1.score))',
            ),

        // .where(
        //   '((u1.id = :userId and pl1.score = pl2.score ) or (u2.id = :userId and pl2.score = pl1.score))',
        //   { userId },
        // ),
        'drawsCount',
      )
      .leftJoinAndSelect('p.user', 'u')
      .where('p.gamePair is not null');

    //console.log(queryBuilder);
    const sortArray = paginatedQuery.sort;

    console.log(sortArray);
    let sortBy, sortDirection;

    sortArray.forEach((sortString) => {
      [sortBy, sortDirection] = sortString.split(' ');

      console.log(sortBy, sortDirection);

      if (sortDirection === SortDirection.ASC.toLowerCase()) {
        sortDirection = SortDirection.ASC;
      } else {
        sortDirection = SortDirection.DESC;
      }
    });
    queryBuilder.addOrderBy(`"${sortBy}" `, sortDirection);
    // console.log(queryBuilder);

    const topUsers = await queryBuilder
      .limit(paginatedQuery.pageSize)
      .offset(skipSize)
      .getRawMany();

    console.log(topUsers);

    const totalCount = Number(topUsers[0].totalCount);

    const pagesCount = paginatedQuery.totalPages(totalCount);

    const mappedTopUsers = await this.topUsersMapping(topUsers);
    console.log(mappedTopUsers);
  }
}
