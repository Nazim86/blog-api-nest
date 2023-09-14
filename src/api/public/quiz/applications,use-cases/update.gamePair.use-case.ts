import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../../infrastructure/quiz/quiz.repository';
import { GamePairEntity } from '../../../entities/quiz/gamePair.entity';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { GameStatusEnum } from '../../../../enums/game-status-enum';
import { QuestionsRepository } from '../../../infrastructure/quiz/questions.repository';

export class UpdateGamePairCommand {
  constructor(public userId: string, public gamePair: GamePairEntity) {}
}

@CommandHandler(UpdateGamePairCommand)
export class UpdateGamePairUseCase {
  constructor(
    private readonly quizRepository: QuizRepository,
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
    private readonly questionsRepository: QuestionsRepository,
  ) {}

  async execute(command: UpdateGamePairCommand) {
    const user = await this.usersRepository.findUserById(command.userId);

    const gamePair = command.gamePair;
    gamePair.player2 = user;
    gamePair.startGameDate = new Date().toISOString();
    gamePair.questions = await this.questionsRepository.getRandomQuestions(5);
    gamePair.status = GameStatusEnum.Active;

    return await this.quizRepository.saveGamePair(gamePair);
  }
}
