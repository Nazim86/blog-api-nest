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

  async getGamePairByUserId(userId: string): Promise<GamePairEntity> {
    //console.log(result);
    return await this.gamePairRepo
      .createQueryBuilder('gp')
      .leftJoinAndSelect('gp.player1', 'pl1')
      .leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('gp.questions', 'q')
      .leftJoinAndSelect('gp.answers', 'a')
      .where('(pl1.id = :userId or pl2.id = :userId)', { userId })
      .getOne();
  }

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
    return await this.answerRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.gamePairs', 'gp')
      .leftJoinAndSelect('a.player', 'pl')
      .leftJoinAndSelect('gp.questions', 'q')
      .where('pl.id = :userId', { userId })
      .andWhere('gp.id = :gamePairId', { gamePairId: gamePairId })
      .getMany();
  }
}
