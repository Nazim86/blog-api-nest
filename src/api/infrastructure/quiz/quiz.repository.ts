import { Repository } from 'typeorm';

import { GamePairEntity } from '../../entities/quiz/gamePair.entity';
import { GameStatusEnum } from '../../../enums/game-status-enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { AnswersEntity } from '../../entities/quiz/answers.entity';
import { PlayersEntity } from '../../entities/quiz/players.entity';

@Injectable()
export class QuizRepository {
  constructor(
    //private readonly dataSource: DataSource,
    @InjectRepository(GamePairEntity)
    private readonly gamePairRepo: Repository<GamePairEntity>,
    @InjectRepository(AnswersEntity)
    private readonly answerRepo: Repository<AnswersEntity>,
    @InjectRepository(PlayersEntity)
    private readonly playersRepo: Repository<PlayersEntity>,
  ) {}

  async savePlayer(player: PlayersEntity) {
    return this.playersRepo.save(player);
  }

  async saveGame(game: GamePairEntity) {
    return this.gamePairRepo.save(game);
  }

  async getGamePairByUserId(userId: string): Promise<GamePairEntity> {
    //console.log(result);
    return await this.gamePairRepo
      .createQueryBuilder('gp')
      .leftJoinAndSelect('gp.player1', 'pl1')
      .leftJoinAndSelect('pl1.user', 'u1')
      .leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('pl2.user', 'u2')
      .leftJoinAndSelect('gp.questions', 'q')
      .leftJoinAndSelect('gp.answers', 'a')
      .where('(u1.id = :userId or u2.id = :userId)', { userId })
      .getOne();
  }

  async getGamePairByUserIdAndGameStatus(
    userId: string,
  ): Promise<GamePairEntity> {
    //console.log(result);
    return await this.gamePairRepo
      .createQueryBuilder('gp')
      .leftJoinAndSelect('gp.player1', 'pl1')
      .leftJoinAndSelect('pl1.user', 'u1')
      .leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('pl2.user', 'u2')
      .leftJoinAndSelect('gp.questions', 'q')
      .leftJoinAndSelect('gp.answers', 'a')
      .where('(u1.id = :userId or u2.id = :userId)', { userId })
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
      .leftJoinAndSelect('pl1.user', 'u1')
      .leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('pl2.user', 'u2')
      .leftJoinAndSelect('gp.questions', 'q')
      .leftJoinAndSelect('gp.answers', 'a')
      .where(`(u1.id = :userId or u2.id = :userId)`, { userId })
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
      .leftJoinAndSelect('pl1.user', 'u1')
      .leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('pl2.user', 'u2')
      .leftJoinAndSelect('gp.questions', 'q')
      .leftJoinAndSelect('gp.answers', 'a')
      .where('gp.id = :id', { id: id })
      .getOne();
  }
  async getGamePairByStatus(status: GameStatusEnum): Promise<GamePairEntity> {
    return this.gamePairRepo
      .createQueryBuilder('gp')
      .leftJoinAndSelect('gp.player1', 'pl1')
      .leftJoinAndSelect('pl1.user', 'u1')
      .leftJoinAndSelect('gp.player2', 'pl2')
      .leftJoinAndSelect('pl2.user', 'u2')
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
      .leftJoinAndSelect('pl.user', 'u')
      .leftJoinAndSelect('gp.questions', 'q')
      .where('u.id = :userId', { userId })
      .andWhere('gp.id = :gamePairId', { gamePairId: gamePairId })
      .getMany();
  }
}
