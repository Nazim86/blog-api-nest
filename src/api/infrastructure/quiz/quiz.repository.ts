import { Repository } from 'typeorm';

import { GamePairEntity } from '../../entities/quiz/gamePair.entity';
import { GameStatusEnum } from '../../../enums/game-status-enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { AnswersEntity } from '../../entities/quiz/answers.entity';

@Injectable()
export class QuizRepository {
  constructor(
    //private readonly dataSource: DataSource,
    @InjectRepository(GamePairEntity)
    private readonly gamePairRepo: Repository<GamePairEntity>,
    @InjectRepository(AnswersEntity)
    private readonly answerRepo: Repository<AnswersEntity>,
  ) {}

  // async savePlayer(player: PlayersEntity) {
  //   return this.playersRepo.save(player);
  // }

  async saveAnswer(answer: AnswersEntity) {
    return this.answerRepo.save(answer);
  }

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
    //console.log(result);
    return await this.gamePairRepo
      .createQueryBuilder('gp')
      .leftJoinAndSelect('gp.player1', 'pl1')
      .leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('gp.questions', 'q')
      .leftJoinAndSelect('gp.answers', 'a')
      .where('(pl1.id = :userId or pl2.id = :userId)', { userId })
      //.orWhere('pl2.id = :userId', { userId: userId })
      //.orderBy('q.createdAt', 'ASC')

      // .andWhere('gp.status = :gameStatus', {
      //   gameStatus: GameStatusEnum.PendingSecondPlayer || GameStatusEnum.Active,
      // })
      .getOne();
  }
  // async getGamePairByUserIdAndGameId(
  //   userId: string,
  //   gameId: string,
  // ): Promise<GamePairEntity> {
  //   //console.log(result);
  //   return await this.gamePairRepo
  //     .createQueryBuilder('gp')
  //     .leftJoinAndSelect('gp.player1', 'pl1')
  //     .leftJoinAndSelect('gp.player2', 'pl2')
  //     .leftJoinAndSelect('gp.questions', 'q')
  //     .leftJoinAndSelect('gp.answers', 'a')
  //     .where('(pl1.id = :userId or pl2.id = :userId)', { userId })
  //     .andWhere('gp.id = gameId', { gameId })
  //     .getOne();
  // }

  async getGamePairByUserIdAndGameStatus(
    userId: string,
  ): Promise<GamePairEntity> {
    //console.log(result);
    return await this.gamePairRepo
      .createQueryBuilder('gp')
      .leftJoinAndSelect('gp.player1', 'pl1')
      .leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('gp.questions', 'q')
      .leftJoinAndSelect('gp.answers', 'a')
      .where('(pl1.id = :userId or pl2.id = :userId)', { userId })
      //.orWhere('pl2.id = :userId', { userId: userId })
      //.orderBy('q.createdAt', 'ASC')

      .andWhere(
        '(gp.status = :gameStatusActive or gp.status = :gameStatusPending)',
        {
          gameStatusActive: GameStatusEnum.Active,
          gameStatusPending: GameStatusEnum.PendingSecondPlayer,
        },
      )
      .getOne();
  }

  async getGamePairByUserIdAndGameStatusActive(
    userId: string,
  ): Promise<GamePairEntity> {
    return await this.gamePairRepo
      .createQueryBuilder('gp')
      .leftJoinAndSelect('gp.player1', 'pl1')
      .leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('gp.questions', 'q')
      .leftJoinAndSelect('gp.answers', 'a')
      .where(`(pl1.id = :userId or pl2.id = :userId)`, { userId })
      .andWhere('gp.status = :gameStatusActive', {
        gameStatusActive: GameStatusEnum.Active,
      })
      .orderBy('q.createdAt', 'ASC')
      .getOne();
  }
  async getGamePairById(id: string): Promise<GamePairEntity> {
    return this.gamePairRepo
      .createQueryBuilder('gp')
      .leftJoinAndSelect('gp.player1', 'pl1')
      .leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('gp.questions', 'q')
      .leftJoinAndSelect('gp.answers', 'a')

      .where('gp.id = :id', { id: id })
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

  async getAnswerByUserIdAndGamePairId(
    userId: string,
    gamePairId: string,
  ): Promise<AnswersEntity[]> {
    // const result2 = this.answerRepo
    //   .createQueryBuilder('a')
    //   //.leftJoinAndSelect('a.player', 'pl')
    //   .leftJoinAndSelect('a.gamePairs', 'gp')
    //   .leftJoinAndSelect('gp.player1', 'pl1')
    //   .leftJoinAndSelect('gp.player2', 'pl2')
    //   .leftJoinAndSelect('gp.questions', 'q')
    //   .where('pl1.id = :userId', { userId: userId })
    //   .orWhere('pl2.id = :userId', { userId: userId })
    //   .andWhere('gp.id = :gamePairId', { gamePairId: gamePairId })
    //   .getSql();
    //
    // writeSql(result2);
    // console.log(result);
    return await this.answerRepo
      .createQueryBuilder('a')
      //.leftJoinAndSelect('a.player', 'pl')
      .leftJoinAndSelect('a.gamePairs', 'gp')
      .leftJoinAndSelect('a.player', 'pl')
      //.leftJoinAndSelect('gp.player1', 'pl1')
      //.leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('gp.questions', 'q')
      .where('pl.id = :userId', { userId })
      //.where('(pl1.id = :userId or pl2.id = :userId)', { userId })
      // .orWhere('pl2.id = :userId', { userId: userId })
      .andWhere('gp.id = :gamePairId', { gamePairId: gamePairId })
      //.orderBy('q.createdAt', 'ASC')
      .getMany();

    // .andWhere('gp.status = :gamePairStatus', {
    //   gamePairStatus: GameStatusEnum.Active,
    // });
  }

  // async getAnswerById(id: string) {
  //   return this.answerRepo
  //     .createQueryBuilder('a')
  //     .leftJoinAndSelect('a.player', 'pl')
  //     .leftJoinAndSelect('a.gamePairs', 'gp')
  //     .leftJoinAndSelect('a.questions', 'q')
  //     .where('pl.id = :userId', { userId: UserId })
  //     .getMany();
  //   // .andWhere('gp.status = :gamePairStatus', {
  //   //   gamePairStatus: GameStatusEnum.Active,
  //   // });
  // }

  // async getPlayerByUserId(userId: string) {
  //   try {
  //     const result = await this.playersRepo
  //       .createQueryBuilder('p')
  //       .leftJoinAndSelect('p.user', 'u')
  //       .leftJoinAndSelect('p.gamePair', 'gp')
  //       .leftJoinAndSelect('gp.questions', 'q')
  //       .leftJoinAndSelect('p.answers', 'a')
  //       .where('u.id = :userId', { userId: userId })
  //       .getOne();
  //     console.log(result);
  //     return result;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
}
