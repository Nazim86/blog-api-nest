import { CommandHandler } from '@nestjs/cqrs';
import { GamePairEntity } from '../../../entities/quiz/gamePair.entity';
import { GameStatusEnum } from '../../../../enums/game-status-enum';
import { QuestionsRepository } from '../../../infrastructure/quiz/questions.repository';
import { DataSource, EntityManager } from 'typeorm';
import { BaseTransaction } from '../../../../common/baseTransaction';
import { TransactionRepository } from '../../../infrastructure/common/transaction.repository';
import { PlayersEntity } from '../../../entities/quiz/players.entity';

export class UpdateGamePairCommand {
  constructor(public player: PlayersEntity, public gamePair: GamePairEntity) {}
}

@CommandHandler(UpdateGamePairCommand)
export class UpdateGamePairUseCase extends BaseTransaction<
  UpdateGamePairCommand,
  string
> {
  constructor(
    dataSource: DataSource,
    private readonly transactionRepository: TransactionRepository,
    private readonly questionsRepository: QuestionsRepository, //private readonly usersRepository: UsersRepository,
  ) {
    super(dataSource);
  }

  async doLogic(command: UpdateGamePairCommand, manager: EntityManager) {
    //const player = await this.usersRepository.findUserById(command.userId);

    // const player: PlayersEntity = await this.quizRepository.getPlayerByUserId(
    //   command.userId,
    // );

    // const questions = await this.questionsRepository.getQuestions();

    const gamePair = command.gamePair;
    gamePair.player2 = command.player;
    gamePair.startGameDate = new Date().toISOString();
    gamePair.questions = await this.questionsRepository.getRandomQuestions(5);
    gamePair.status = GameStatusEnum.Active;

    const game = await this.transactionRepository.save(gamePair, manager);

    return game.id;
  }

  async execute(command: UpdateGamePairCommand) {
    return super.run(command);
  }
}
