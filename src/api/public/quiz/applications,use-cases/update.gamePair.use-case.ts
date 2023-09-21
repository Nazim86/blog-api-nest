import { CommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../../infrastructure/quiz/quiz.repository';
import { GamePairEntity } from '../../../entities/quiz/gamePair.entity';
import { GameStatusEnum } from '../../../../enums/game-status-enum';
import { QuestionsRepository } from '../../../infrastructure/quiz/questions.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';

export class UpdateGamePairCommand {
  constructor(public userId: string, public gamePair: GamePairEntity) {}
}

@CommandHandler(UpdateGamePairCommand)
export class UpdateGamePairUseCase {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly questionsRepository: QuestionsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: UpdateGamePairCommand) {
    const player = await this.usersRepository.findUserById(command.userId);

    // const player: PlayersEntity = await this.quizRepository.getPlayerByUserId(
    //   command.userId,
    // );

    const gamePair = command.gamePair;
    gamePair.player2 = player;
    gamePair.startGameDate = new Date().toISOString();
    gamePair.questions = await this.questionsRepository.getRandomQuestions(5);
    gamePair.status = GameStatusEnum.Active;

    return await this.quizRepository.saveGamePair(gamePair);
  }
}
