import { CommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../../infrastructure/quiz/quiz.repository';
import { GamePairEntity } from '../../../entities/quiz/gamePair.entity';
import { GameStatusEnum } from '../../../../enums/game-status-enum';
import { UsersRepository } from '../../../infrastructure/users/users.repository';

export class CreateGamePairCommand {
  constructor(public userId: string) {}
}

@CommandHandler(CreateGamePairCommand)
export class CreateGamePairUseCase {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateGamePairCommand) {
    //return this.createGameTransaction.run(command.userId);

    const player = await this.usersRepository.findUserById(command.userId);
    //const player = await this.quizRepository.getPlayerByUserId(command.userId);

    const gamePair = new GamePairEntity();
    gamePair.player1 = player;
    gamePair.pairCreatedDate = new Date().toISOString();
    gamePair.status = GameStatusEnum.PendingSecondPlayer;
    // gamePair.answers = [];

    const game = await this.quizRepository.saveGamePair(gamePair);

    //console.log(result);
    return game.id;
  }
}
