import { CommandBus } from '@nestjs/cqrs';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { GameStatusEnum } from '../../../../enums/game-status-enum';
import { QuizRepository } from '../../../infrastructure/quiz/quiz.repository';
import { Injectable } from '@nestjs/common';
import { GamePairEntity } from '../../../entities/quiz/gamePair.entity';
import { CreateGamePairCommand } from './create.gamePair.use-case';
import { UpdateGamePairCommand } from './update.gamePair.use-case';
import { PlayersEntity } from '../../../entities/quiz/players.entity';
import { UsersRepository } from '../../../infrastructure/users/users.repository';

@Injectable()
export class CreateConnectionService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createConnection(userId: string) {
    const user = await this.usersRepository.findUserById(userId);

    const gamePairByUserId = await this.quizRepository.getGamePairByUserId(
      userId,
    );

    if (
      gamePairByUserId &&
      (gamePairByUserId.status === GameStatusEnum.Active ||
        gamePairByUserId.status === GameStatusEnum.PendingSecondPlayer)
    )
      return { code: ResultCode.Forbidden };

    const newPlayer = new PlayersEntity();
    newPlayer.user = user;
    newPlayer.gamePair = gamePairByUserId;

    const player: PlayersEntity = await this.quizRepository.savePlayer(
      newPlayer,
    );

    const gamePairByStatus: GamePairEntity =
      await this.quizRepository.getGamePairByStatus(
        GameStatusEnum.PendingSecondPlayer,
      );

    let gamePairId;

    if (!gamePairByStatus) {
      gamePairId = await this.commandBus.execute(
        new CreateGamePairCommand(player),
      );
    } else {
      gamePairId = await this.commandBus.execute(
        new UpdateGamePairCommand(player, gamePairByStatus),
      );
    }

    //console.log(gamePairId);

    return { code: ResultCode.Success, data: gamePairId };
  }
}
