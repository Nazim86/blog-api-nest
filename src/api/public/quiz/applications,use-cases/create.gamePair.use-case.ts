import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../../infrastructure/quiz/quiz.repository';
import { GamePairEntity } from '../../../entities/quiz/gamePair.entity';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { GameStatusEnum } from '../../../../enums/game-status-enum';

export class CreateGamePairCommand {
  constructor(public userId: string) {}
}

@CommandHandler(CreateGamePairCommand)
export class CreateGamePairUseCase {
  constructor(
    private readonly quizRepository: QuizRepository,
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateGamePairCommand) {
    const user = await this.usersRepository.findUserById(command.userId);

    const gamePair = new GamePairEntity();
    gamePair.player1 = user;
    gamePair.pairCreatedDate = new Date().toISOString();
    gamePair.status = GameStatusEnum.PendingSecondPlayer;

    return await this.quizRepository.saveGamePair(gamePair);
  }
}
