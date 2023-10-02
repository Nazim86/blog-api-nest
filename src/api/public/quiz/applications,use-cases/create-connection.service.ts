import { CommandBus } from '@nestjs/cqrs';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { GameStatusEnum } from '../../../../enums/game-status-enum';
import { QuizRepository } from '../../../infrastructure/quiz/quiz.repository';
import { Injectable } from '@nestjs/common';
import { GamePairEntity } from '../../../entities/quiz/gamePair.entity';
import { CreateGamePairCommand } from './create.gamePair.use-case';
import { UpdateGamePairCommand } from './update.gamePair.use-case';

@Injectable()
export class CreateConnectionService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private commandBus: CommandBus,
  ) {}

  async createConnection(userId: string) {
    // let player: PlayersEntity = await this.quizRepository.getPlayerByUserId(
    //   userId,
    // );
    //
    // if (!player) {
    //   player = await this.commandBus.execute(new CreatePlayerCommand(userId));
    // }
    //
    // if (
    //   player.gamePair &&
    //   (player.gamePair.status === GameStatusEnum.Active ||
    //     player.gamePair.status === GameStatusEnum.PendingSecondPlayer)
    // )
    //   return { code: ResultCode.Forbidden };

    //console.log(gamePairByUserId);

    const gamePairByUserId = await this.quizRepository.getGamePairByUserId(
      userId,
    );

    if (
      gamePairByUserId &&
      (gamePairByUserId.status === GameStatusEnum.Active ||
        gamePairByUserId.status === GameStatusEnum.PendingSecondPlayer)
    )
      return { code: ResultCode.Forbidden };

    const gamePairByStatus: GamePairEntity =
      await this.quizRepository.getGamePairByStatus(
        GameStatusEnum.PendingSecondPlayer,
      );

    //console.log(gamePairByStatus);

    let gamePairId;

    if (!gamePairByStatus) {
      gamePairId = await this.commandBus.execute(
        new CreateGamePairCommand(userId),
      );
    } else {
      gamePairId = await this.commandBus.execute(
        new UpdateGamePairCommand(userId, gamePairByStatus),
      );
    }

    //console.log(gamePairId);

    return { code: ResultCode.Success, data: gamePairId };
  }
}
