import { CommandBus } from '@nestjs/cqrs';
import { CreateGamePairCommand } from './create.gamePair.use-case';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { GameStatusEnum } from '../../../../enums/game-status-enum';
import { UpdateGamePairCommand } from './update.gamePair.use-case';
import { GamePairEntity } from '../../../entities/quiz/gamePair.entity';
import { QuizRepository } from '../../../infrastructure/quiz/quiz.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateConnectionService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private commandBus: CommandBus,
  ) {}

  async createConnection(userId: string) {
    const gamePairByUserId = await this.quizRepository.getGamePairByUserId(
      userId,
    );

    //console.log(gamePairByUserId);

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

    let gamePair;

    if (!gamePairByStatus) {
      gamePair = await this.commandBus.execute(
        new CreateGamePairCommand(userId),
      );
    } else {
      gamePair = await this.commandBus.execute(
        new UpdateGamePairCommand(userId, gamePairByStatus),
      );
    }

    return { code: ResultCode.Success, data: gamePair.id };

    // const player = await this.playersRepository.getPlayerByUserId(userId);
    //
    // if (!player) {
    //   const player = await this.commandBus.execute(
    //     new CreatePlayerCommand(userId),
    //   );
    // }
  }
}
